$(function() {

  var fs = require("fs");
  var http = require("http");
  var async = require("async");
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
      manager.dealWithInfo(results.info);
    });
  }
});