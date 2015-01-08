$(function () {
   ///////////////////////////////////////////////////////////window bar click
  if(typeof require!="undefined"){
                                                                      //窗口栏
    var nw = require('nw.gui');

    var win = nw.Window.get();

    win.isMaximized = false;

    win.setMinimumSize(950, 550);
   
    if(typeof require!="undefined"){                                                     

      $("#min").click(function(){

          win.minimize();
      });                                                        
      
      $("#max").click(function(){
          if (win.isMaximized){
              win.unmaximize();
          }else{
              win.maximize();
          }
      });
      
      $("#close").click(function(){
          win.close();
      });

      
      win.on('maximize',function(){
          win.isMaximized = true;
      });

      win.on('unmaximize',function(){
          win.isMaximized = false;
      })

      win.on('loaded', function() {
         
          
      });
    }

  } 
    ////////////////////////////////////////////////////////////your code
    var async = require("./bower_components/async");
    var user = 'client';
    var isOperating = false;
    var app_item_class = ["active","","success"];
    var db_info = [];
    var loop = null;
    var userLoadTheAppItem = false;

    setTimeout(function(){
                  $("#loader").fadeOut(); 
                  BootstrapDialog.show({
                      title: 'SETTING',
                      message: 'Please choose the user.',
                      buttons: [{
                          label: 'Client',
                          action: function(dialog) {
                            user = "client";
                            initUI();
                            dialog.close();
                              //dialog.setTitle('Title 1');
                          }
                      }, {
                          label: 'Server',
                          action: function(dialog) {
                            user = "server";
                            initUI();
                              //dialog.setTitle('Title 2');
                              dialog.close();
                              
                          }
                      }]
                  });            
                },1500);
    
    function chooseFile(chooser) {
      //var chooser = $(name);
      chooser.change(function(evt) {
        var appPath = $(this).val();
        var appName = appPath.split("\\").pop();
        console.log(appName)
        //console.log($(this).val());
        chooser.parent().siblings(".file_path").html(appPath);
        chooser.parent().siblings(".app_name").html(appName);
        resetOperation(chooser);
      });

      chooser.trigger('click');  
    }
   
    
    var exec;
    if(typeof require!="undefined"){

       exec = require('child_process').execFile;
    }
    var fun =function(target,filePath){
       //console.log("fun() start");
      var child = exec(filePath, function(err, data) {  
            console.log(err)
            console.log(data.toString());                     
        });

      console.log(child);
      //resetOperation(target);
      //alert(typeof child.pid);
      //return child;  
    }
    initUI();
    // $("#user").click(function(){
    //   if(user == "client") {
    //      user = 'server';
    //      $(this).html('server');  
    //   }else{
    //     user = 'client';
    //      $(this).html('client');  
    //   }
    //   initUI();
      
    // });
    // $(".choose_file").click(function(){
    //   chooseFile($(this).siblings('.fileDialog'));
    // });

    // $(".run_app").click(function(){
    //   if(user == "client") {
    //     var appPath = $(this).parent().siblings(".file_path").html();
    //     //console.log(appPath.length);
    //     if(appPath == "null"){
    //       alert("Please choose a valide app path!");
    //     }else{
    //       var nameArray = appPath.split("\\");

    //       var appName = appPath.split("\\").pop();
    //       $(this).parent().siblings(".app_name").html(appName);
    //     }
    //     fun(this,appPath);   
    //     var that = this;
    //     setTimeout(function(){
    //       getProcessPidByName(that,$(that).parent().siblings(".app_name").html());
    //     },1000);  
    //   }
    //  if(user == "server") {
    //   connection.query('UPDATE app_items SET operation = "run" WHERE app_id = "'+$(this).parent().siblings(".app_id").html()+'"',                  
    //                  function(err){
    //                    if(err){
    //                     console.log(err);
    //                    }
    //                  });     
    //  } 
      
    // });

    // $(".stop_app").click(function(){
    //   if(user == 'client') {
    //     //process.kill(_pid_1, 'SIGINT');
    //     var that = this;
    //     setTimeout(function(){
    //       killProcessByPid(that);  
    //     },500);
        
    //     //console.log(pids);
    //     //alert(typeof process.pid);
    //   }
    //   if(user == "server") {
    //     connection.query('UPDATE app_items SET operation = "stop" WHERE app_id = "'+$(this).parent().siblings(".app_id").html()+'"',                  
    //                  function(err){
    //                    if(err){
    //                     console.log(err);
    //                    }
    //                  });  
    //   }
      
    // });
    function initUI(){
       if(user == "client") {
         $(".run_app").hide();
          $(".stop_app").hide();
          $('.choose_file').show();
      
        }
        if(user == "server") {
          $('.choose_file').hide();
            $(".run_app").show();
            $(".stop_app").show();
            $("#database_add").hide();
            $("#database_remove").hide();
          
        }
    }
    function addItemClickEvent(target) {
      var $item = target.children('.operation');
      $item.children(".choose_file").click(function(){
        chooseFile($(this).siblings('.fileDialog'));
      });

      $item.children(".run_app").click(function(){
          if(user == "client") {
              var appPath = $(this).parent().siblings(".file_path").html();
              console.log(typeof appPath);
              //console.log(appPath.length);
              if(appPath == "null"){
                alert("Please choose a valide app path!");
              }else{
                var nameArray = appPath.split("\\");
                console.log(nameArray); 
                var appName = appPath.split("\\").pop();
                console.log("appName:"+appName);
                $(this).parent().siblings(".app_name").html(appName);
              }
              fun(this,appPath);   
              var that = this;
              setTimeout(function(){
                getProcessPidByName(that,$(that).parent().siblings(".app_name").html());
              },1000);  
            }
           if(user == "server") {
            if($(this).parent().siblings(".app_status").html() == "Running") {
              alert("App is already Running!");
              return;
            }
            connection.query('UPDATE app_items SET operation = "run" WHERE app_id = "'+$(this).parent().siblings(".app_id").html()+'"',                  
                           function(err){
                             if(err){
                              console.log(err);
                             }
                           });     
           } 
      });
        

      $item.children(".stop_app").click(function(){
          if(user == 'client') {
            //process.kill(_pid_1, 'SIGINT');
            var that = this;
            setTimeout(function(){
              killProcessByPid(that);  
            },500);
            
            //console.log(pids);
            //alert(typeof process.pid);
          }
          if(user == "server") {
            if($(this).parent().siblings(".app_status").html() == "null") {
              alert("No app is running!");
              return;
            }
            connection.query('UPDATE app_items SET operation = "stop" WHERE app_id = "'+$(this).parent().siblings(".app_id").html()+'"',                  
                         function(err){
                           if(err){
                            console.log(err);
                           }
                         });  
          }
      });
       
    }
    
    $("#database_add").click(function(){
      createAppItem();
    });

    $("#database_remove").click(function(){
      removeAppItem();
    });
    $("#database_update").click(function(){
      info_upload();
    });
    
    //var result_pids = new Array();
    function getProcessPidByName(target,name) {
      console.log(name);
      var Pro = {
        _pids:[],
        _status:[]
      };
      var exec = require('child_process').exec;

      exec('tasklist', function(err, stdout, stderr) { 
         
        var lines = stdout.toString().split('\n');

        //var results = new Array();
        lines.forEach(function(line) {

          var parts = line.split('=');
          
          parts.forEach(function(items){
             //console.log(items);
            items = items.replace(/\s{2,}/g, ' ');
             //console.log(items);
            if(items.toString().indexOf(name) > -1){
                 items=items.split(" ");
                 //console.log(items.toString().substring(items.toString().indexOf("nw.exe"),4));
                 console.log(items);
                 Pro._pids.push(items[1]);
                 Pro._status.push(items[2]);
                 //console.log(results);
                 //process.kill(items[1], 'SIGINT');
            }
          }) 
        });
        //console.log(pids)
        //console.log(Pro._pids.length);
        if(Pro._pids.length != 0){
          console.log("pids length1" + Pro._pids.length);
          $(target).parent().siblings(".app_pid").html(Pro._pids.toString());  
          $(target).parent().siblings(".app_status").html("Running"); 
           resetOperation(target);       
        }
        else{
          console.log("pids length2" + Pro._pids.length);
          $(target).parent().siblings(".app_pid").html("null");  
          $(target).parent().siblings(".app_status").html("null"); 
           resetOperation(target);   
          return;
        }
        
      });
      
      
    }
    
    function killProcessByPid(target) {
      var pid = $(target).parent().siblings(".app_pid").html();
      pid = parseInt(pid);
      try{
         process.kill(pid, 'SIGINT');      
      }catch(Exception){
        alert(Exception);
      }
      
      $(target).parent().siblings(".app_pid").html("null");
      $(target).parent().siblings(".app_status").html("null");
      resetOperation(target);
    }

    function createAppItem() {
      var index = parseInt($('.app_items tr').length);
      //alert((index)%3);
      var html = '<tr id="'+ (++index) +'"'+'class="'+app_item_class[(index-1)%2]+'">'+
              '<td class="app_id">'+(index)+'</td>'+
              '<td class="app_name">null</td>'+
              '<td class="file_path">null</td>'+
              '<td class="app_pid">null</td>'+
              '<td class="app_status">null</td>'+
              '<td class="operation">'+
                '<input style="display:none;" class="fileDialog" type="file" accept=".exe"/>'+
                '<input type="button" value="slect" class="choose_file"/>'+
                '&nbsp;<input style="display:none;" type="button" value="run" class="run_app"/>'+
                '&nbsp;<input style="display:none;" type="button" value="close" class="stop_app"/>'+
              '</td>'+
            '</tr>';

      var item = $(html);
      addItemClickEvent(item);
      $(".app_items").append(item);
      info_upload();
    }
    function createAppItemByValue(value) {
      var index = value.app_id;
      var html = null;
      var item = null;
      //alert((index)%3);
      if(userLoadTheAppItem == true) {
        userLoadTheAppItem =false;
        
        html = '<tr id="'+ (index) +'"'+'class="'+app_item_class[(index)%2]+'">'+
              '<td class="app_id">'+(index)+'</td>'+
              '<td class="app_name">'+value.app_name+'</td>'+
              '<td class="file_path">'+value.app_path+'</td>'+
              '<td class="app_pid">'+value.pid+'</td>'+
              '<td class="app_status">'+value.status+'</td>'+
              '<td class="operation">'+
                '<input style="display:none;" class="fileDialog" type="file" accept=".exe"/>'+
                '<input type="button" value="slect" class="choose_file"/>'+
                '&nbsp;<input style="display:none;" type="button" value="run" class="run_app"/>'+
                '&nbsp;<input style="display:none;" type="button" value="close" class="stop_app"/>'+
              '</td>'+
            '</tr>';
        item = $(html);
        addItemClickEvent(item);
        $(".app_items").append(item);
        getProcessPidByName(item.children(".operation").children(".run_app"),value.app_name);
      }else{
         html = '<tr id="'+ (index) +'"'+'class="'+app_item_class[(index)%2]+'">'+
              '<td class="app_id">'+(index)+'</td>'+
              '<td class="app_name">'+value.app_name+'</td>'+
              '<td class="file_path">'+value.app_path+'</td>'+
              '<td class="app_pid">'+value.pid+'</td>'+
              '<td class="app_status">'+value.status+'</td>'+
              '<td class="operation">'+
                '&nbsp;<input type="button" value="run" class="run_app"/>'+
                '&nbsp;<input type="button" value="close" class="stop_app"/>'+
              '</td>'+
            '</tr>';
          item = $(html);
          addItemClickEvent(item);
          $(".app_items").append(item);
      }
      
      
      
    }
    function removeAppItem() {
      $('.app_items tr:last-child').remove();
      async.series([function(){info_upload();},deleteAllItem("app_items")]);
    }
    function info_upload() {
      db_info = [];
      $(".app_items tr").each(function(index){

        
         var item = {
          app_id:index+1,
          app_name:$(this).children('.app_name').html(),
          app_path:$(this).children('.file_path').html().replace(/\\/g,"\\\\"),
          app_pid:$(this).children('.app_pid').html(),
          app_status:$(this).children('.app_status').html(),
          app_operation:"none"
         };

         db_info.push(item);
      });
      //console.log(db_info);

      // useDatabase("app_manager");
      // async.series([function(){
      //   $.each(db_info,function(index,value){
      //         updateDatabase(value);
      //       })  
      // },deleteAllItem("app_items")]);
       
      $.each(db_info,function(index,value){
              updateDatabase(value);
            })  
      
      
      

    }
    function updateDatabase(value) {
      
       connection.query('SELECT * FROM app_items WHERE id = "'+value.app_id+'" ',
        function(err,results,fields){
           if(err){
            console.log("find "+value.app_id +"err!")
             console.log(err);
             insertItems(value);
           }else{
              if(results.length){
                connection.query('UPDATE app_items SET '+
                'app_name = "'+value.app_name+'", '+
                'app_path = "'+value.app_path+'", '+
                'pid = "'+value.app_pid+'", '+
                'status = "'+value.app_status+'", '+
                'operation = "none" '+
                'WHERE app_id = "'+value.app_id+'"',
                function(err){
                  if(err) {
                    console.log(err);
                  }
                  console.log("update database success!")
                  updateOperationt("app_items");
                });  
              }else{
                console.log("find "+value.app_id +"err!")
                 console.log(err);
                 insertItems(value);
              }
            
           }
        });
              

             
    }
    function updateOperationt(name) {
      connection.query(
        'SELECT * FROM '+name,
        function selectCb(err, results, fields) {
            if (err) {
                console.log("ERROR: " + err.message);
                //throw err;
            }
            //console.log("Got "+results.length+" Rows:");
            if(typeof results.length == 'undefined') {
              return;
            }
            console.log(results);
            if(user == "server") {
              if(results.length != $(".app_items").children().length) {
                $(".app_items").children().remove();
              }
            }
            $.each(results,function(index,value){
              if(user == "client") {
                if(isOperating == false) {
                  
                  if(value.operation == "run"){
                    isOperating = true;
                    $(".app_items").children("#"+value.app_id).children(".operation").children(".run_app").trigger("click");
                    
                  }
                  if(value.operation == "stop"){
                    isOperating = true;
                    $(".app_items").children("#"+value.app_id).children(".operation").children(".stop_app").trigger("click");
                  }
                  if(value.operation == "none") {
                    // moreUpdateOperation();
                  }
                }  
              }
              if(userLoadTheAppItem == true) {
                
                updateAppList(value);
              }
              if(user == "server") {
                
                updateAppList(value);
              }
              
              
            });
            //console.log("The meta data about the columns:");
            //console.log(fields);
           // connection.end();
        });
    }
    // function moreUpdateOperation() {
    //   setTimeout(function(){
    //               updateOperationt("app_items");
    //             },1000);
    // }
    function resetOperation(target) {
      isOperating = false;
      info_upload();
      connection.query('UPDATE app_items SET operation = "none" WHERE app_id = "'+$(target).parent().siblings(".app_id").html()+'"',                  
                     function(err){
                       if(err){
                        console.log(err);
                       }
                       // moreUpdateOperation();
                     });  
    }
    function updateAppList(value) {
      if($(".app_items").children("#"+value.app_id).length) {
        console.log('..........list from server update..........');
        var row = $(".app_items").children("#"+value.app_id);
        row.children(".app_name").html(value.app_name);
        row.children(".file_path").html(value.app_path);
        row.children(".app_pid").html(value.pid);
        row.children(".app_status").html(value.status);
      }else {
        createAppItemByValue(value);
      }
    }
    // function triggerRunApp(index,value) {
      
    //   $('.app_table').trigger("click");
    //   $('.app_items').children("#"+value.app_id).children(".operation").children(".run_app").css("background","#900");//children("#"+value.app_id).children(".operation").children(".app_run").css("background","#900");
    //   //$(".app_items").children("#"+value.app_id).children(".operation").children(".app_run").trigger("click");
    // }
    ///////////////////////////////////////////////////////database connect
    var mysql = require('./node_modules/mysql');
    var connection;
    var db_con_info = {
      addr:"127.0.01",
      port:"3306",
      username:"admin",
      password:"",
      database : "app_manager"
    }
    
    

    $("#database_connect").click(function(){
      console.log($(this).html());
      if($(this).html() == "disconnect") {
         try{
            disconnect();
            clearInterval(loop);
            loop = null;
         }catch(err){
           alert(err);
         }
         $("#database_status").val("null");
         $("#database_connect").removeClass("btn-success").addClass("btn-primary").html("connect");
         return;
      }

      db_con_info = {
        addr:$("#database_addr").val(),
        port:$("#database_port").val(),
        username:$("#database_username").val(),
        password:$("#database_password").val()   
      }
      console.log(db_con_info);
      connectDatabase();
    });
    function connectDatabase() {
      connection = mysql.createConnection({
        host : db_con_info.addr,
        port : db_con_info.port,
        user : db_con_info.username,
        password : db_con_info.password
      });

      console.log({
        host : db_con_info.addr,
        port : db_con_info.port,
        user : db_con_info.username,
        password : db_con_info.password});

      connection.connect(function(err) {
        if (err) {
          //alert("Please check mysql setting is right /the database server is running /the network is ok.");
          alert('error connecting: ' + err.stack);
          console.error('error connecting: ' + err.stack);
          $("#database_status").val("no connect"); 
          $("#database_connect").removeClass("btn-primary").addClass("btn-danger").html("failed");
          setTimeout(function(){
            $("#database_connect").removeClass("btn-danger").addClass("btn-primary").html("connect");
          },2000);

          return;
        }
        $("#database_status").val("connected");
        $("#database_connect").removeClass("btn-primary").addClass("btn-success").html("seccess");
        setTimeout(function(){
            $("#database_connect").html("disconnect");
        },2000);
        console.log('connected as id ' + connection.threadId);
        
        //if(user == "client") {
         createDatabase("app_manager");
        //   async.series([function(){
        //      setInterval(function(){
        //         updateOperationt("app_items");
        //       },5000);
        //    },useDatabase("app_manager"),createDatabase("app_manager")]);
        // //}
        
      });
    }
    function createDatabase (database) {
      connection.query('CREATE DATABASE '+ database, function(err, results) {
        //if (err && err.number != connection.ERROR_DB_CREATE_EXISTS) {
        if (err) {
          console.log(err.code);
          console.log("ERROR: " + err.message);
          if(err.code == "ER_DB_CREATE_EXISTS") {
              useDatabase("app_manager");
          }else{
            alert("Please check the datebase is serving!");
          }
          return;
        }else{
          useDatabase("app_manager");
          console.log("database of "+ database + " created OR already exists.");  
        }
        
        
      });
    };
    function useDatabase(name) {
      
      connection.query('USE ' + name, function(err, results) {
        if (err) {
          console.log("use database ERROR: " + err.message);
          //throw err;
        }else{
          console.log("use app_manager database ok!");
          if(user == "client") {
            createTable("app_items");    
          }
          if(user == "server") {
              loop = setInterval(function(){
                  updateOperationt("app_items");
              },1000);
          }
          
        }
        
      });
      
    }
    function createTable(name) {
      connection.query(
          'CREATE TABLE '+ name +
          '(id INT(11) AUTO_INCREMENT, '+
          'app_name VARCHAR(255), '+
          'app_id INT(11), '+
          'app_path VARCHAR(255), '+
          'pid VARCHAR(255), '+
          'status VARCHAR(255), '+
          'operation VARCHAR(255), '+
          'PRIMARY KEY (id));', function(err, results) {
            if (err) {
              console.log(err);
              if(err.code == "ER_TABLE_EXISTS_ERROR") {
               userLoadTheAppItem = true;
               loop = setInterval(function(){
                  updateOperationt("app_items");
                },1000);
              }
              console.log("create table ERROR: " + err.message);
              
            }else{
              console.log(results);
              console.log("create table sucess!");  
              loop = setInterval(function(){
                  updateOperationt("app_items");
                },1000);
            }
            
            
            
            
          }
        );
    }
    
    function disconnect(){
      connection.end(function(err) {
         // The connection is terminated now
      });
    }
    function listTable(name) {
      connection.query(
        'SELECT * FROM '+name,
        function selectCb(err, results, fields) {
            if (err) {
                console.log("ERROR: " + err.message);
                throw err;
            }
            console.log("Got "+results.length+" Rows:");
            console.log(results);
            //console.log("The meta data about the columns:");
            //console.log(fields);
           // connection.end();
        });
    }
    function deleteItemById(id) {
      connection.query(
        'DELETE FROM app_items WHERE id="'+id+'"',
         function(err, rows, fields) {
           if (err) {
               console.log("delete err:"+err);
           }
           console.log("delete ok!");
        });

    }
    function deleteItemByAppName(app_name) {
      connection.query(
        'DELETE FROM app_items WHERE app_name="'+app_name+'"',
         function(err, rows, fields) {
           if (err) {
               console.log("delete err:"+err);
           }
           console.log("delete ok!");
        });

    }
    function insertItems(info) {
      connection.query(
                  'INSERT INTO app_items'+
                  ' SET app_name = "'+info.app_name+'"'+
                  ', app_id = "'+info.app_id+'"'+
                  ', app_path = "'+info.app_path+'"'+
                  ', pid = "'+info.app_pid+'"'+
                  ', status = "'+info.app_status+'"'+
                  ', operation = "'+info.app_operation+'"',
                  function(err, results) {
                      if (err) {
                          console.log("ERROR: " + err.message);
                          throw err;
                      }
                      console.dir(results);
                      console.log(results);
                      console.log("Inserted "+results.affectedRows+" row.");
                      console.log("The unique id was " + results.insertId);
                      listTable("app_items");
                      //deleteItemByAppName("null");
                      //deleteItemByAppName("undefined");
                  }
              );
    }
    function deleteAllItem(tableName) {
      connection.query(
        'truncate '+tableName,
         function(err, rows, fields) {
           if (err) {
               console.log("delete all err:"+err);
           }
           console.log("delete all ok!");

        });
    }
});