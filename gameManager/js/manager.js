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
			win.x = screen.width - $(window).width();
			win.y = parseInt((screen.height - $(window).height()) * 1.0 / 2);
		});
}

//get manager config
p.getManagerConfig = function(callback) {
	var config = this.readJson("config.json");
	callback(null, config);
}

//read json file by path
p.readJson = function(path) {
	return $.parseJSON(fs.readFileSync(path, "utf-8"));
};

//get information from server
p.getInfoFromServer = function(callback) {
	this.getInfoByHttp(callback);
}

//get information by http protocol
p.getInfoByHttp = function(callback) {
	http.get("http://localhost:8081/gm_stn01.php?type=get&" + Math.floor(Math.random() * 110000), function(res) {
		var body = '';
		res.on('data', function(d) {
			body += d;
			//console.log(body);
			callback(null, JSON.parse(body));
		});

	}).on('error', function(e) {
		console.log(e);
	});
}

//manager according the information,which from the server,to deal with the game operations,ect
p.dealWithInfo = function(info) {
	//console.log(info);
	//show the patient status
	if (info.isShow) {

		//update the SpO2 value
		$("#SpO2").html(info.SpO2);

		//update the HR value
		$("#HR").html(info.HR);

		//update the status colors
		switch (parseInt(info.status)) {
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
	$.each(info.game, function(index, value) {
		//console.log(value);
		if (typeof manager.games[index] == "undefined") {
			//console.log(this);
			manager.games[index] = new Game(value);
			manager.games[index].setPath(config.); 
		}
		//update games
		manager.games[index].update(value);
	});



}