;
var async = require("async");

//game class
function Game(gameInfo) {
	this.init(gameInfo);
}

var p = Game.prototype;

p._path = null;

p._startTime = null;

p._endTime = null;

p._pid = null;

p._name = null;

p.init = function(gameInfo) {
	this._startTime = new Date().toString() //.replace(/T/,' ').replace(/\..+/,'');
		//console.log(this.startTime);
}

//update the accordding to the main loop which is written in the main.js
//gameInfo: the game information from the server
p.update = function(gameInfo) {
	var game = this;

	async.series({
		isRunning: function(callback) {
			game.isRunning(gameInfo.name, callback);
		},
	}, function(err, results) {
		if (results.isRunning == true) {
			//if game information`s operation from server is end or stop
			if (gameInfo.operate == 'stop') {
				game.killProcessByPid(game._pids[0]);
			}

		} else {
			//if game information`s operation from server is run 
			//if game is not running then run it 
			if (gameInfo.operate == 'run') {
				var exec = require('child_process').execFile;
				//console.log("fun() start");
				var child = exec(game._path, function(err, data) {
					console.log(err)
					console.log(data.toString());
				});
			}

		}
	});
}

//start or run the app(game) 
p.isRunning = function(name, callback) {
	var game = this;
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

//get pids by app(game) name
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

//kill the app by it`s pid
p.killProcessByPid = function(pid) {
	try {
		process.kill(pid, 'SIGINT');
	} catch (Exception) {
		alert(Exception);
	}
}

//set game path that use to start the game
p.setPath = function(path) {
	this._path = path;
}