'use strict';
const config = require("./config.js");
const SteamUser = require("steam-user");
const TradeOfferManager = require("steam-tradeoffer-manager");
const SteamCommunity = require("steamcommunity");
const SteamTotp = require("steam-totp");
//const SteamMobileConfirmations = require("steam-mobile-confirmations");
const mysql = require("mysql");
const express = require("express");
const request = require("request");
const fs = require("fs");

const app = express();
const con = mysql.createConnection(config.mysql);
const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
  steam: client,
  community: community,
  //"domain": config.domain,
  language: "en",
  cancelTime: config.cancelTime
});

var prices = null;
var activeOffers = [];
var bots = [];

con.connect((err) => {
  if (err) {
    log("ERROR", err);
  }
});

client.logOn({
  accountName: config.bot.name,
  password: config.password,
  twoFactorCode: SteamTotp.generateAuthCode(config.bot.shared_secret),
  rememberPassword: true
});

client.on("loggedOn", () => {
  log("INFO", "Logged into steam");
  client.setPersona(SteamUser.Steam.EPersonaState.Online);
});

client.on("webSession", (sessionid, cookies) => {
  manager.setCookies(cookies);
  community.setCookies(cookies);
});

//manager.apiKey = config.apiKey;

manager.on("newOffer", (offer) => {
  if (offer.itemsToGive.length === 0) {
    offer.accept((err, status) => {
      if (err) {
        log("ERROR", err);
      } else {
        log("INFO", "Donation accepted. Status: " + status);
      }
    });
  } else {
    offer.decline((err) => {
      if (err) {
        log("ERROR", err);
      } else {
        log("INFO", "Donation declined (wanted our items)");
      }
    });
  }
});

manager.on("sentOfferChanged", (offer, oldState) => {
  switch (offer.state) {
    case 3: //Offer was accepted
      for (var i in activeOffers) {
        if (activeOffers[i].id === offer.id) {
          activeOffers.splice(i, 1);
          break;
        }
      }
      con.query("UPDATE withdraws SET state = ? WHERE tradeid = ?", ["3", offer.id], (err, result) => {
        if (err) {
          log("ERROR", err);
        } else {
          log("INFO", "Offer: " + offer.id + "completed");
        }
      });
      break;
    case 4: //Recipent made a counter offer
      offer.cancel();
    case 5: //Offer is expired
    case 6: //Offer was canceled by sender
    case 7: //Offer was declined by recipent
    case 8: //Offer has items that are no longer available
    case 10: //Offer has been canceled via email/mobile confirmation
    //case 11: //Trade has been placed on hold
      for (var i in activeOffers) {
        if (activeOffers[i].id === offer.id) {
          activeOffers.splice(i, 1);
          break;
        } else {
          continue;
        }
      }
      log("INFO", "Offer: " + offer.id + " " + offer.status);
      con.query("SELECT value FROM withdraws WHERE tradeid = ?", [offer.id], (err, result, fields) => {
        if (err) {
          log("ERROR", err);
        } else {
          con.query("SELECT coins FROM users WHERE steamid = ?", [offer.partner.getSteamID64()], (err, result2, fields2) => {
            if (err) {
              log("ERROR", err);
            } else {
              con.query("UPDATE users SET coins = ? WHERE steamid = ?; UPDATE withdraws SET state = ? WHERE tradeid = ?",
                [result[0].value + result2[0].coins, offer.partner, offer.state, offer.id], (err, result) => {
                if (err) {
                  log("ERROR", err);
                } else {
                  log("INFO", "Returned coins to user from offer: " + offer.id)
                }
              });
            }
          });
        }
      });
      break;
  }
});

function log(level, message) {
  fs.appendFile('log.txt', Date.now() + " | " + level + " | " + message + "\n");
}

function getItemsInTrade() {
  var itemsInTrade = [];
  for (var i in activeOffers) {
    for (var n in activeOffers[i].itemsToGive) {
      itemsInTrade.push(activeOffers[i].itemsToGive[n].assetid);
    }
  }
  return itemsInTrade;
}

function getBotsAccountsIds() {
  return client.steamID.getSteamID64();
}

function getPrice(item) {
  return prices[item.market_hash_name];
}

function updatePrice(fr) {
  request("http://api.csgofast.com/price/all", (err, res, body) => {
    if (err) {
      log("ERROR", err);
    } else {
      prices = JSON.parse(body);
    }
  });
}

app.post("/withdraw", (req, res) => {
  var json = JSON.parse(req.body);
  var cr = null;
  var value = 0;
  if (json.token !== config.token) return "0x01";
  
  const offer = manager.createOffer(json.partner);
  manager.getInventoryContents(730, 2, false, (err, items, currencies) => { //Fetch all items that are in bot's inventory
    if (err) {
      client.relog();
      cr = 0x04;
      return;
    }

    for (var i in json.items) { //Add requested items
      var item = items.find((element) => element.assetid == json.items[i].assetid);
      if (item) {
        value += getPrice(item.market_hash_name);
        offer.addMyItem(item);
      } else {
        cr = 0x02;
        break;
      }
    }

    if (cr != null) return;

    con.query("SELECT coins FROM users WHERE steamid = ? AND coins >= ?", [offer.partner, value * config.valueMultiplier], (err, result, fields) => {
      if (err) {
        log("ERROR", err);
        cr = 0x06;
        return;
      }
      if (result.length === 1) {
        con.query("INSERT INTO withdraws (steamid, tradeid, coins, state) VALUES ?; UPDATE users SET coins = ? WHERE steamid = ?", 
          [[offer.partner.getSteamID64(), offer.id, value * config.valueMultiplier, offer.state], result[0].coins - value * config.valueMultiplier, 
          offer.partner.getSteamID64()], (err, result2) => {
          if (err) {
            log("ERROR", err);
            cr = 0x06;
            return;
          } else {
            log("INFO", "Offer: " + offer.id + " sent");
            log("INFO", "User: " + offer.partner.getSteamID64() + " updated coins" + result[0].coins + " - " + value * config.valueMultiplier);
          }
        });
        if (cr != null) return;

        offer.send((err, status) => {
          if (err) {
            cr = 0x08;
            return;
          }
          log("INFO", "Offer: " + offer.id + " sent");
          if (status == "pending") { //Confirm a trade if it's required
            community.getConfirmations(SteamTotp.time(), SteamTotp.getConfirmationKey(config.bot.identity_secret, SteamTotp.time(), "allow"), (err, confirmations) => { //Fetch all current confirmations
              for (var i in confirmations) {
                if (confirmations[i].type == 2 && confirmations[i].creator == offer.id) {
                  confirmations[i].respond(SteamTotp.time(), SteamTotp.getConfirmationKey(config.bot.identity_secret, SteamTotp.time(), "allow"), true, (err) => {
                    if (err) {
                      log("ERROR", err);
                      cr = 0x09;
                    }
                  });
                }
              }
            });
          }
        });
        if (cr != null) return;

        if (offer.status == 11) { //Cancel a trade if it's in escrow
          offer.cancel((err) => {
            if (err) {
              log("ERROR", err);
            } else {
              log("INFO", "Offer: " + offer.id + " canceled because it was in escrow");              
              cr = 0x08;
              return;
            }
          });
        }
        if (cr != null) return;
        cr = 0x00
        activeOffers.push(offer);
      } else {
        cr = 0x03;
      }
    });
  });
  res.send(cr);
});

app.get("/getItemsInTrade", (req, res) => {
  res.send(getItemsInTrade());
});

app.get("/getBotsAccountsIds", (req, res) => {
  res.send(getBotsAccountsIds());
});

app.listen(config.port);