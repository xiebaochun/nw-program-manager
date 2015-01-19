;
var async = require("async");
var open = require("open");
var http = require("http");

//game class
function Game() {
	//this.init(gameInfo);
}

var p = Game.prototype;

p._path = null;

p._startTime = null;

p._endTime = null;

p._pid = null;

p._name = null;

p._gameCategory = null;


//localGameConfig:game:{name:"xx",path:"xx"}
p.init = function(localGameConfig) {
	this._startTime = new Date().toString() //.replace(/T/,' ').replace(/\..+/,'');
		//console.log(this.startTime);
	this._path = localGameConfig.path;
	this._name = localGameConfig.name;

	//if game path is the http url then the game category is the web game
	if (/http/.test(this._path)) {
		this._gameCategory = "web";
		//if the game path is the execute application then the game category is the local executale game
	} else {
		this._gameCategory = "exe"
	}

}

/**
update the accordding to the main loop which is written in the main.js
gameInfo: the game information from the server
{
 name: "xx",	
 operate: "run/stop"
}
*/

p.update = function(gameInfo) {
	var game = this;

	async.series({
		isRunning: function(callback) {
			game.isRunning(gameInfo.name, callback);
		},
	}, function(err, results) {
		console.log(results);
		if (results.isRunning == true) {
			//if game information`s operation from server is end or stop
			if (gameInfo.operate == 'stop') {
				//game.killProcessByPid(game._pids[0]);
				game.stop();
			}

		} else {
			//if game information`s operation from server is run 
			//if game is not running then run it 
			console.log(game._gameCategory)
			console.log(gameInfo.operate)
			if (gameInfo.operate == 'run') {
				//if game category is the web game (cycling game)
				if (game._gameCategory == "web") {
					var gamePoint = open(game._path, "chrome");
				} else {
					var exec = require('child_process').execFile;
					//console.log("fun() start");
					var child = exec(game._path, function(err, data) {
						console.log(err)
						console.log(data.toString());
					});
				}

			}

		}
	});
}

//start or run the app(game) 
p.isRunning = function(name, callback) {
	var game = this;

	if (this._gameCategory == "web") {
		async.series({
			gameStatus: function(callback) {
				game.getInfoByHttp(game, "", callback);
			}
		}, function(err, results) {
			if (results.gameStatus.gameStatus == "null") {
				callback(null,false);
			}
			if (results.gameStatus.gameStatus == "running") {
				callback(null,true);
			}
		});

	} else {
		async.series({
			pids: function(callback) {
				game.getProcessPidByName(name, callback);
			},
		}, function(err, results) {
			if (results.pids.length != 0) {
				game._pids = results.pids;
				callback(null, true);
			} else {
				callback(null, false);
			}
		})
	}



}

/**
 * get pids by app(game) name
 * @param  {string} process game
 * @param  {Function} callback
 * @return {object} the process information
 */
p.getProcessPidByName = function(name, callback) {

	var game = this;

	var Pro = {
		_pids: [],
		_status: []
	};

	var exec = require('child_process').exec;

	exec('tasklist', function(err, stdout, stderr) {

		var lines = stdout.toString().split('\n');

		//var results = new Array();
		lines.forEach(function(line) {

			var parts = line.split('=');

			parts.forEach(function(items) {
				//console.log(items);
				items = items.replace(/\s{2,}/g, ' ');
				//console.log(items);
				if (items.toString().indexOf(name) > -1) {
					items = items.split(" ");
					//console.log(items.toString().substring(items.toString().indexOf("nw.exe"),4));
					console.log(items);
					Pro._pids.push(items[1]);
					Pro._status.push(items[2]);

				}
			})
		});
		callback(null, Pro._pids);
	});
}

/**
 * kill the app by it`s pid
 * @param  {number} pid of game which to be stoped
 * @return {null}
 */
p.killProcessByPid = function(pid) {
	try {
		process.kill(pid, 'SIGINT');
	} catch (Exception) {
		alert(Exception);
	}
}

/**
 * set game path that use to start the game
 * @param {string} path the path of the game
 */
p.setPath = function(path) {
	this._path = path;
}

/**
 * stop the game
 * @return {null}
 */
p.stop = function() {
	var game = this;
	//pre work 
	async.series({
		prework: function(callback) {
			if (game._gameCategory == "web") {
				game.getInfoByHttp(game, "&operate=stop", callback);
			}
		}
	}, function(err, results) {
		if (err) {
			console.log(err);
		}
		if (results.prework == "done") {
			this._endTime = new Date().toString();
			sendMessage();
		}
	});
}

/**
 * http get method to inform the web game to stop itself
 * @param  {object} game self
 * @param  {Function} async callback
 * @return {object} the information from game server
 */
p.getInfoByHttp = function(game, options, callback) {
	http.get(game._path + "/communicator.php?type=get" + options, function(res) {
		var body = '';
		res.on('data', function(d) {
			body += d;
			console.log(body);
			callback(null, JSON.parse(body));
		});

	}).on('error', function(e) {
		console.log(e);
	});
}