$(function() {
  ///////////////////////////////////////////////////////////window bar click
  //窗口栏
  //
  var fs = require("fs");
  var http = require("http");
  var async = require("async");

  if (typeof require != "undefined") {

    var nw_tool = require('nw.gui');

    var win_tool = nw_tool.Window.get();

    win_tool.isMaximized = false;

    win_tool.setMinimumSize(950, 550);

    $("#min").click(function() {
      win_tool.minimize();
    });

    $("#max").click(function() {
      console.log($(window).width() + ":" + screen.width);
      if ($(window).width() >= screen.width) {
        win_tool.unmaximize();
      } else {
        win_tool.maximize();
      }
    });

    $("#close").click(function() {
      win_tool.close();
    });


    win_tool.on('maximize', function() {
      win_tool.isMaximized = true;
    });

    win_tool.on('unmaximize', function() {
      win_tool.isMaximized = false;
    })

    win_tool.on('loaded', function() {


    });

    window.onkeydown = function(evt) {
      if (evt.which == 116) {
        window.location.reload(true)
      }
      if (evt.which == 123) {
        win_tool.showDevTools();
      }
    }

  }
  ////////////////////////////////////////////////////////////your code
  setTimeout(function() {
    $("#loader").fadeOut();
  }, 100);

  loadItems(1);

  $("#choose_file").click(function() {
    chooseFile($(this).siblings('.fileDialog'));
  });

  $("#push").click(function() {
    http: //220.246.72.77/pms/gm/gmtest.php?stn=6&gno=1&status=1&spo2=100&hr=90&alarm=0&gamepath=http://220.246.72.77/bikegame/index.html
      var query = 'stn=' + $("#Stn").val() + '&' +
      "pno=2&"+
      "glevel=3&"+
      'gno=' + $("#GameNo").val() + '&' +
      'status=' + $("#Status").val() + '&' +
      'spo2=' + $("#SpO2").val() + '&' +
      'hr=' + $("#HR").val() + '&' +
      'alarm=' + $("#Alarm").val() + '&' +
      'gamepath=' + $("#GamePath").val();
    //console.log(query);

    async.series({
        result: function(callback) {
          getInfoByHttp('http://220.246.72.77/pms/gm/gmtest.php?' + query, callback);
        },
      },
      function(err, results) {
        //console.log(results.result);
        //alert('Message from server:' + results.result + ' \n If "OK" means update(push) success.');
        $(".message-box").fadeIn();
        setTimeout(function() {
          $(".message-box").fadeOut();
        },3000);

      });
  });
  /*
  load Items 
   */
  var hold = $('<div></div>');
  function loadItems(stn) {
    // $(".music-items").empty();
    
    async.series({
        list: function(callback) {
          getInfoByHttp("http://220.246.72.77/pms/gm/gmc.php?stn=" + stn, callback);
        },
      },
      function(err, results) {
        //console.log(JSON.parse(results.list));
        var list = JSON.parse(results.list);
        list_musics(hold,list);
        if (stn < 5) {
          loadItems(++stn);
        } else {
          $(".music-items").empty();
          var content = hold.clone(true);
          $(".music-items").append(content);
          setTimeout(function() {
            hold.empty();
            loadItems(1);
          }, 5000);

        }
      });
  }

  /*
  list the music files
   */
  function list_musics(hold,list) {

      var html = '<div class="music-item">' +
        '<li class="nav-item" id="stn">' + list.Stn + '</li>' +
        '<li class="nav-item" id="pno">' + list.Pno + '</li>' +
        '<li class="nav-item">' + list.Glevel + '</li>' +
        '<li class="nav-item">' + list.GameNo + '</li>' +
        '<li class="nav-item" id="game-path">' + list.GamePath + '</li>' +
        '<li class="nav-item">' + list.Status + '</li>' +
        '<li class="nav-item">' + list.SpO2 + '</li>' +
        '<li class="nav-item">' + list.HR + '</li>' +
        '<li class="nav-item">' + list.Alarm + '</li>' +
        '</div>'

      var element = $(html);

      hold.append(element);

      //$(".music-items").append(element);

      // $.each(list, function(index, item) {


      //   var html = '<div class="music-item"><div id="music-name">' + item.name + '</div><div id="music-author">' + item.author + '</div></div>'

      //   var element = $(html);

      //   element.click(function() {

      //     //console.log("click");
      //     $(".current-music-item").removeClass("current-music-item");

      //     $(this).addClass("current-music-item");

      //     $("#playing-song-info").html(item.name);

      //     audioPlayer.play(item.file_name);

      //   });

      //   $(".music-items").append(element);

      // });
    }
    /*
    get information by http protocol
     */
    //get information by http protocol
  function getInfoByHttp(server_query, callback) {
    // $.get(server_query, function(data) {
    //  console.log(data);
    //  alert("Load was performed.");
    // });
    http.get(server_query, function(res) {
      var body = '';
      res.on('data', function(d) {
        //console.log(d);
        body += d;
        body = body.replace('[', '').replace(']', '').replace(/\\/g, "\\/");
        //alert(body);
        //console.log(body);
        callback(null, body);
      });

    }).on('error', function(e) {
      console.log(e);
    });
  }

  function chooseFile(chooser) {
    //var chooser = $(name);
    chooser.change(function(evt) {
      var appPath = $(this).val();
      var appName = appPath.split("\\").pop();
      console.log(appName)
        //console.log($(this).val());
      $("#GamePath").val(appPath);
      //chooser.parent().siblings(".app_name").html(appName);
      //resetOperation(chooser);
    });
    chooser.trigger('click');
  }
});