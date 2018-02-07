/https:\/\/steamcdn-a.akamaihd.net\/apps\/730\/icons\/econ\/stickers\/[a-z0-9]{1,}\/[a-z.0-9_]{1,}.png/g

//Yes i know that this code is terrible
$(document).ready(function(){
  // http://community.edgecast.steamstatic.com/economy/image/
  var v0; //Variable that holds json inventory
  var id; //VAriable that holds a bot steamid
  //Fetch bots accounts ids
  $.ajax({
    url: 'getBotsAccountsIds', //TODO: Change this to correct address
    type: 'GET',
    dataType: 'json',
    success: function(data){
      data.forEach(function(bot){
        $("#bots").append("<option value=\"" + bot + "\">" + bot + "</option>");
      });
    },
    error: function(xhr, error, status){
      Materialize.toast("An error occuried while trying to fetch bots accounts", 4000);
    }
  });

  //On bots select change value
  $("#bots").change(function(){
    id = this.value;
    //Fetch inventory for selected id
    $.ajax({
      url: "http://steamcommunity.com/profiles/" + id + "/inventory/json/730/2",
      type: 'GET',
      dataType: 'json',
      success: function(data){
        v0 = data.rgInventory;

        //Fetch items that are currently in trade
        $.ajax({
          url: 'getItemsInTrade', //TODO: Change this to correct address
          type: 'GET',
          dataType: 'json',
          success: function(data){
            v0.some(function(element, index, array){
              data.some(function(element2, index2, array2){
                if(element.id === element2){
                  v0.splice(index, 1);
                  return true;
                } else {
                  return false;
                }
              });
            });
            v0.forEach(function(element){
              $("#v").append("<input type=\"checkbox\" name=\""+element.id+"\">");
            });
            $("#v").append("<input type=\"submit\" value=\"Withdraw items\">");
          },
          error: function(xhr, error, status){
            Materialize.toast("An error occuried while trying to fetch items in trade", 4000);
          }
        });
      },
      error: function(xhr, error, status){
        Materialize.toast("An error occuried while trying to fetch bot items", 4000);
      }
    });
  });
});

//^^^^^^^^^
//This is a old script
//New script is in test.js

//New code
$(document).ready(function(){
  // http://community.edgecast.steamstatic.com/economy/image/
  var v0; //Variable that holds json inventory
  var id; //VAriable that holds a bot steamid
  //Fetch bots accounts ids
  $.ajax({
    url: 'getBotsAccountsIds', //TODO: Change this to correct address
    type: 'GET',
    dataType: 'json',
    success: function(data){
      data.forEach(function(bot){
        $("#bots").append("<option value=\"" + bot + "\">" + bot + "</option>");
      });
    },
    error: function(xhr, error, status){
      Materialize.toast("An error occuried while trying to fetch bots accounts", 4000);
    }
  });

  //On bots select change value
  $("#bots").change(function(){
    id = this.value;
    //Fetch inventory for selected id
    $.ajax({
      url: "http://steamcommunity.com/profiles/" + id + "/inventory/json/730/2",
      type: 'GET',
      dataType: 'json',
      success: function(data){
        v0 = data.rgInventory;

        //Fetch items that are currently in trade
        $.ajax({
          url: 'getItemsInTrade', //TODO: Change this to correct address
          type: 'GET',
          dataType: 'json',
          success: function(data){
            v0.some(function(element, index, array){
              data.some(function(element2, index2, array2){
                if(element.id === element2){
                  v0.splice(index, 1);
                  return true;
                } else {
                  return false;
                }
              });
            });
            v0.forEach(function(element){
              $("#v").append("<input type=\"checkbox\" name=\""+element.id+"\">");
            });
            $("#v").append("<input type=\"submit\" value=\"Withdraw items\">");
          },
          error: function(xhr, error, status){
            Materialize.toast("An error occuried while trying to fetch items in trade", 4000);
          }
        });
      },
      error: function(xhr, error, status){
        Materialize.toast("An error occuried while trying to fetch bot items", 4000);
      }
    });
  });
});