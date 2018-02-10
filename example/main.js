$(document).ready(function() {
  var v0;
  var v1;
  var v2;
  var v3;
  var v4;

  $.ajax({
    url: "https://steamcommunity.com/id/CerteX-Play/inventory/json/730/2",
    type: "GET",
    dataType: "json",
    success: function(data) {
      v0 = JSON.parse(data);
    },
    error: function(xhr, error, status) {
      Materialize.toast("An error occuried when trying to fetch bot items", 4000);
    }
  });

  $.ajax({
    url: "", //TODO: Set a url for fetching a items that are currently in trade
    type: "GET",
    dataType: "json",
    success: function(data){
      v4 = data;
    },
    error: function(xhr, error, status) {
      v4 = null;
      Materialize.toast("An error occuried when trying to fetch items that are currently in trade", 4000);
    }
  });

  for (var i in v0["rgInventory"]) {
    if (v0["rgInventory"][i]["instanceid"] == "0") {
      for (var n in v0["rgInventory"]) {
        if (n == i) {
          continue;
        } else {
          if (v0["rgInventory"][n]["classid"] == v0["rgInventory"][i]["classid"]) {
            v0["rgInventory"][i]["amount"] = String(parseInt(v0["rgInventory"][i]["amount"]) + 1);
            v0["rgInventory"][n] = undefined;
          }
        }
      }
    }
  }

  if (v4 !== null) {
    for (var i in v0["rgInventory"]) {
      for (var n in v4) {
        if (v0["rgInventory"][i]["id"] == v4[n]) {
          v0["rgInventory"][i] = undefined;
        }
      }
    }
  }

  for (var i in v0["rgInventory"]) {
    $("#v").append("<div name=\"" +
      v0["rgDescriptions"][v0["rgInventory"][i]["classid"] + "_" +
      v0["rgInventory"][i]["instanceid"]]["market_hash_name"] + "\">");
    if (v0["rgInventory"][i]["instanceid"] == 0) {
      v1 = v0["rgDescriptions"][v0["rgInventory"][i]["classid"] + "_" + v0["rgInventory"][i]["instanceid"]];
      $("#v").append("<img src=\"https://steamcommunity-a.akamaihd.net/economy/image/" +
        v1["icon_url"] +
        "\">" + "|| x" + v0["rgInventory"][i]["amount"]);
    } else {
      v1 = v0["rgDescriptions"][v0["rgInventory"][i]["classid"] + "_" + v0["rgInventory"][i]["instanceid"]];
      v2 = v1["descriptions"][v1["descriptions"].length - 1]["value"].match(/https:\/\/steamcdn-a.akamaihd.net\/apps\/730\/icons\/econ\/stickers\/[a-z0-9]{1,}\/[a-z.0-9_]{1,}.png/g);
      if (v2 !== null) {
        for (var n in v2) {
          v3 += "<img src=\"" + v2[n] + "\">";
        }
      } else {
        v3 = null;
      }
      $("#v").append("<img src=\"https://steamcommunity-a.akamaihd.net/economy/image/" +
        v1["icon_url"] +
        "\">" + v3);
    }
    $("#v").append("</div>");
  }
});
//Search
$(document).ready(function() {
  $("#search").change(function() {
    var v6 = $("#v > div:hidden").toArray();
    for (var i in v6) {
      v6[i].show();
    }
    var v5 = $("[name!=\"" + $(this).text() + "\"]").toArray();
    for (var i in v5) {
      v5[i].hide();
    }
  });
});