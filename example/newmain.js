$(document).ready(function() {
  var v0, v1, v2, v3, v4, v5;
  //Fetch items in bot inventory
  $.ajax({
    url: "http://steamcommunity.com/inventory/76561198102316593/730/2?l=english&count=5000",
    type: "GET",
    dataType: "json",
    success: function(data) {
      v0 = JSON.parse(data);
    },
    error: function(xhr, error, status) {
      Materialize.toast("An error occurred when trying to fetch bot items", 4000);
    }
  });
  //Fetch items that are currently in trade
  $.ajax({
    url: "", //TODO: Set a url for fetching a items that are currently in trade
    type: "GET",
    dataType: "json",
    success: function(data) {
      v1 = JSON.parse(data);
    },
    error: function(xhr, error, status) {
      v1 = null;
      Materialize.toast("An error occurred when trying to fetch items that are currently in trade", 4000);
    }
  });
  //
  for (var i in v0["assets"]) {
    if (v0["assets"][i]["instanceid"] == "0") {
      for (var n in v0["assets"]) {
        if (n == i) {
          continue;
        } else {
          if (v0["assets"][n]["classid"] == v0["assets"][i]["classid"]) {
            v0["assets"][i]["amount"] = String(parseInt(v0["assets"][i]["amount"]) + 1);
            v0["assets"][n] = undefined;
          }
        }
      }
    }
  }
  //Remove items that are currently in trade
  if (v4 != null) {
    for (var i in v0["assets"]) {
      for (var n in v1) {
        if (v0["assets"][i]["assetid"] == v1[n]) {
          v0["assets"][i] = undefined;
        }
      }
    }
  }
  //Remove items that are not tradeable
  for (var i in v0["descriptions"]) {
    if (v0["descriptions"][i]["tradeable"] == 0) {
      for (var n in v0["assets"]) {
        if (v0["assets"][n]["classid"] == v0["descriptions"][i]["classid"]) {
          v0["assets"][n] = undefined;
          v0["descriptions"][i] = undefined;
        }
      }
    }
  }
  //
  for (var i in v0["assets"]) {
    for (var n in v0["descriptions"]) {
      if (v0["assets"][i]["classid"] == v0["descriptions"][n]["classid"]) {
        $("#v").append("<div name=\"" +
          v0["descriptions"][n]["market_hash_name"] + "\">");
        if (v0["assets"][i]["instanceid"] == 0) {
          $("#v").append("<img src\"https://steamcommunity-a.akamaihd.net/economy/image/" +
            v0["descriptions"][n]["icon_url"] + "\">" + "||x" + v0["assets"][i]["amount"]);
        } else {
          v2 = v0["descriptions"][n]["descriptions"][v0["descriptions"][n]["descriptions"].length - 1]["value"].match(
            /https:\/\/steamcdn-a\.akamaihd\.net\/apps\/730\/icons\/econ\/stickers\/[a-z0-9]{1,}\/[a-z.0-9_]{1,}\.png/g);
          if (v2 !== null) {
            for (var d in v2) {
              v3 += "<img src\"" + v2[d] + "\">";
            }
          } else {
            v3 = null;
          }
          $("#v").append("<img src\"https://steamcommunity-a.akamaihd.net/economy/images/" +
            v0["descriptions"][n]["icon_url"] + "\"" + v3);
        }
        $("#v").append("</div>");
      }
    }
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