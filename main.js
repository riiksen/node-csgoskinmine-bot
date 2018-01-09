const config = require('./config.js');
const SteamUser = require('steam-user');
const TradeOfferManager = require('steam-tradeoffer-manager');
const SteamTotp = require('steam-totp');
const SteamMobileConfirmations = require('steam-mobile-confirmations');
const mysql = require('mysql');
const express = require('express');
const request = require('request');
const fs = require('fs');

var prices = null;
var activeOffers = [];
var con = mysql.createConnection(config.mysql);

con.connect(function(err){
	if(err) throw err;
});

const app = express();

var client = new SteamUser();

var manager = new TradeOfferManager({
	"steam": client,
	"domain": config.domain,
	"language": "en",
	"cancelTime": config.cancelTime
});

manager.apiKey = config.apiKey;

client.logOn({
	"accountName": config.bot.name,
	"password": config.bot.password,
	"twoFactorCode": SteamTotp.generateAuthCode(config.bot.shared_secret)
});

client.on('loggedOn', function(){
	client.setPersona(SteamUser.Steam.EPersonaState.Online);
});

client.on('webSession', function(sessionID, cookies){
	
	steamConfirmations = new SteamMobileConfirmations({
		steamid: client.steamID,
		identity_secret: config.bot.identity_secret,
		webCookie: cookies
	});

	mobileConfirm();
	
	manager.setCookies(cookies, function(err){
		if(err) {
			log(err);
			process.exit(1);
			return;
		}
		log("Logged in");
	});
});


manager.on('newOffer', function(offer){
	if(offer.itemsToGive == 0){
		offer.accept(function(err, status){
			if(err) log(err);
			else log(status);
		});
	} else {
		offer.decline(function(err){
			if(err) log(err);
		});
	}
});

manager.on('realTimeTradeCompleted', function(offer){
	activeOffers.some(function(element, index, array){ //Using some instead of forEach for performance
		if(element.id === offer.id){
			activeOffers.splice(index, 1);
			return true;
		} else {
			return false;
		}
	});
	con.query("UPDATE withdraws SET state = 'complete' WHERE tradeid = " + offer.id, function(err, result){
		if(err) log(err);
		else log("offer: " + offer.id + " Updated state to complete");
	});
});

manager.on('sentOfferChanged', function(offer, oldState){
	activeOffers.some(function(element, index, array){
		if(element.id === offer.id){
			activeOffers.splice(index, 1);
			return true;
		} else {
			return false;
		}
	});
	offer.decline(function(err){
		if(err) log(err);
		else log();
	});
	con.query("SELECT value FROM withdraws WHERE tradeid = '"+offer.id+"'", function(err, result, fields){
		if(err) log(err);
		else {
			con.query("SELECT coins FROM users WHERE steamid = "+offer.partner, function(err2, result2, fields2){
				if(err) log(err);
				else {
					con.query("UPDATE users SET coins = "+result[0].value+result2[0].coins+" WHERE steamid = "+offer.partner, function(err, result){
						if(err) log(err);
						else {
							log("offer: "+offer.id+"changed, returned coins to user");
							con.query("UPDATE withdraws SET state = 'changed' WHERE tradeid = "+offer.id, function(err, result){
								if(err) log(err);
							});
						}
					});
				}
			});
		}
	});
});


manager.on('sentOfferCanceled', function(offer, reason){
	activeOffers.some(function(element, index, array){
		if(element.id === offer.id){
			activeOffers.splice(index, 1);
			return true;
		} else {
			return false;
		}
	});
	con.query("SELECT value FROM withdraws WHERE tradeid = '"+offer.id+"'", function(err, result, fields){
		if(err) log(err);
		else {
			con.query("SELECT coins FROM users WHERE steamid = "+offer.partner, function(err2, result2, fields2){
				con.query("UPDATE users SET coins = "+ result[0].coins+result2[0].coins+" WHERE steamid = "+offer.partner, function(err, result){
					if(err) log(err);
					else log("offer: "+offer.id+" canceled, returned coins to user");
					con.query("UPDATE withdraws SET state = 'canceled' WHERE tradeid = " + offer.id, function(err, result){
						if(err) log(err);
					});
				});
			});
		}
	})
});

function log(text){
	fs.appendFile('log.txt', Date.now() + text);
}

function reAuth(){
	client.logOff();
	client.logOn({
		"accountName": config.bot.name,
		"password": config.bot.password,
		"twoFactorCode": SteamTotp.generateAuthCode(config.bot.shared_secret)
	});
	client.webLogOn();
}

function mobileConfirm(){
	steamConfirmations.FetchConfirmations(function (err, confirmations){
		if (err){
			log(err);
			return;
		}
		if (!confirmations.length){
			return;
		}
		confirmations.forEach(function(confirmation) {
			steamConfirmations.AcceptConfirmation(confirmation, (function (err, result){
				if (err){
					log(err);
					return;
				}
				log('Mobile Confirmation: ' + result);
			}));
		});
	});
}

function updatePrice(fr){
	request('http://api.csgofast.com/price/all', {json:true}, function(err, res, body){
		if(err){
			log(err);
			return;
		}
		prices = body;
	});
}

function getPrice(item){
	return prices[item.market_hash_name];
}

function sendoffer(json){
	var json = JSON.parse(json);
	var ce = null; //Callback error
	var value = 0;
	if (json.token !== config.token) return "0x01";

	const offer = this.manager.createOffer(json.partner);
	manager.getInventoryContents(730, 2, false, function(err, items, currencies){
		if(err) {
			reAuth();
			ce = "0x04";
			return;
		}
		for (var i = 0; i < json.items.length; i++) {
			var item = inv.find(item => item.assetid === json.items[i].assetid);
			if(item) {
				value += getPrice(item.market_hash_name);
				offer.addMyItem(item);
			} else {
				ce = "0x02";
				return;
			}
		}

		con.query("SELECT coins FROM users WHERE steamid = "+offer.partner+"AND coins >= "+value * 100000, function(err, result, fields){
			if(err){
				ce = 0x06;
				return;
			}
			if(result.length === 1){
				offer.send(function(err, status){
					if(err){
						ce = "0x05";
						return;
					}
					mobileConfirm();
					con.query("INSERT INTO withdraws (staemid, tradeid, coins, state) VALUES ("+offer.partner+','+offer.id+','+value*100000+", 'pending')", function(err, result){
						if(err){
							ce = "0x06";
							return;
						} else {
							log("offer sent: "+offer.id);
						}
					});
					if(ce != null) return;
					con.query("UPDATE users SET coins = "+result[0].coins-value*100000+"WHERE steamid = "+offer.partner, function(err, result){
						if(err){
							ce = "0x06";
							return;
						} else {
							log("Updated user: "+offer.partner+" Coins");
						}
					});
					if(ce != null) return;
					else {
						ce = "0x00";
						activeOffers.push(offer);
					}
				});
			} else {
				ce = 0x03;
			}
		});
	});
	return cr;
}

function getItemsInTrade(){
	var itemsInTrade = [];
	activeOffers.forEach(function(offer){
		offer.itemsToGive.forEach(function(items){
			itemsInTrade.push(item.assetid);
		});
	});
	return itemsInTrade;
}

app.post('/withdraw', function(req, res){
	res.send(sendoffer(req.body));
});

app.get('/getItemsInTrade', function(req, res){
	res.send(getItemsInTrade());
})

updatePrice();
setInterval(updatePrice, 600000);

app.listen(31337);