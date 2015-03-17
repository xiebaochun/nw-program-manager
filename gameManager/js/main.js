$(function() {

  var fs = require("fs");
  var http = require("http");
  var async = require("async");

  var nw = require('nw.gui');

  var win = nw.Window.get();
  win.setResizable(false);

  //Double click the main panel to close the game manager
  $(document).dblclick(function() {
    var r = confirm("Quit the game manager?");
    if (r == true) {
      win.close();  
    }else{
      //Do nothing
    }
  });

  //new a manager and init it
  var manager = new Manager();

  //set the manager main loop
  var _mainLoop = setInterval(mainLoop, 3000);

  //manager main loop run per 3 seconed
  function mainLoop() {
    //get information from server
    async.series({
      info: function(callback) {
        manager.getInfoFromServer(callback);
      },
    }, function(err, results) {
      //according the information to deal with game`s business
      //console.log(results.info);
      //console.log(JSON.parse('{"Stn":"1","GameNo":"1","GamePath":"E:\/company_resource\/game manager\/game-manager","Status":"0","SpO2":"100","HR":"90","Alarm":"0"}'));
      manager.dealWithInfo(JSON.parse(results.info));
    });
  }
});