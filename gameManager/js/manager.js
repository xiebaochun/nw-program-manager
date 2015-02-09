;
var fs = require("fs");
var http = require("http");
var async = require("async");

//manager class
function Manager() {
	this.init();
}

//assin p with Manager prototype 
var p = Manager.prototype;

p.games = [];

p.config = null;

//manager intialize function
p.init = function() {

	/*
	window bar click
	窗口栏
	*/

	var nw = require('nw.gui');

	var win = nw.Window.get();

	//add function key event,f5 to reload manager,f12 to show the dev-tools 
	window.onkeydown = function(evt) {
		if (evt.which == 116) {
			window.location.reload(true)
		}
		if (evt.which == 123) {
			win.showDevTools();
		}
	}

	//make the manager allways in the top of other application
	win.setAlwaysOnTop(true);

	//set the manager backgrund transparent
	win.setTransparent(true);

	//win.setResizable(false);

	//set the manager`s size
	win.width = 265;
	win.height = 419;

	//hold the manager
	var manager = this;

	//read manager config.json then init the manager position , ect...
	async.series({
			config: function(callback) {
				///console.log(manager);
				manager.getManagerConfig(callback);
			},
		},
		function(err, results) {
			//
			manager.config = results.config;

			manager.server_query = manager.config.web_link + "?stn=" + manager.config.stn;
			//alert(manager.server_query);
			if (manager.config.position.left == "default") {
				win.x = screen.width - $(window).width();
			} else {
				win.x = parseInt(manager.config.position.left);
			}

			if (manager.config.position.top == "default") {
				win.y = parseInt((screen.height - $(window).height()) * 1.0 / 2);
			} else {
				win.y = parseInt(manager.config.position.top);
			}

		});
}

//get manager config
p.getManagerConfig = function(callback) {

	//console.log(process.execPath);
	//alert(process.cwd());
	var config_path = process.execPath.replace(/[^\\]*$/,"");
	//alert(config_path);
	var config = this.readJson(config_path+"config.json");
	callback(null, config);
}

//read json file by path
p.readJson = function(path) {
	return $.parseJSON(fs.readFileSync(path, "utf-8"));
};

//get information from server
p.getInfoFromServer = function(callback) {
	//alert(this.server_query);
	this.getInfoByHttp(this.server_query, callback);
}

//get information by http protocol
p.getInfoByHttp = function(server_query, callback) {
	// $.get(server_query, function(data) {
	// 	console.log(data);
	// 	alert("Load was performed.");
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

//manager according the information,which from the server,to deal with the game operations,ect
p.dealWithInfo = function(info) {
	//console.log(info);
	//show the patient status

	if (true) {

		//update the SpO2 value
		$("#SpO2").html(info.SpO2);

		//update the HR value
		$("#HR").html(info.HR);

		//update the status colors
		switch (parseInt(info.Alarm)) {
			case 0:
				//console.log("css");
				$("#status").css({
					"border-top-color": "#fff"
				}); //white
				break;

			case 1:

				$("#status").css({
					"border-top-color": "#ee1"
				}); //orange
				break;

			case 2:

				$("#status").css({
					"border-top-color": "red"
				}); //red
				break;

			default:
				//defualt color
				break;
		}
	}

	//checkout the game information
	//console.log(typeof this.games[3]);
	var manager = this;
	// $.each(info.game, function(index, value) {
	// 	console.log("manager:value:" + value);
	// 	console.log(value);
	// 	var serverGame = value;
	// 	if (typeof manager.games[index] == "undefined") {
	// 		//console.log(this);
	// 		manager.games[index] = new Game();
	// 		$.each(manager.config.games, function(index, value) {
	// 			//console.log(value);
	// 			console.log(value);
	// 			if (value.name == serverGame.name) {
	// 				console.log("init the game with value：" + value);
	// 				manager.games[index].init(value);
	// 				//manager.games[index].setPath(value.path); 		
	// 			}
	// 		})
	// 	}
	// 	//update games
	// 	manager.games[index].update(value);
	// });
	if (typeof manager.games[0] == "undefined") {
		var gameInfo = {
			gameNo: info.GameNo,
			gamePath: info.GamePath
		}
		manager.games[0] = new Game(gameInfo);
	}
	var gameUpdataInfo = {
		gameNo: info.GameNo,
		gamePath: info.GamePath,
		gameStatus: info.Status,
		gameStn: info.Stn
	}

	manager.games[0].update(gameUpdataInfo);


}