;
var async = require("async");
var open = require("open");
var http = require("http");
var jsonpatch = require('fast-json-patch');

//game class
function Game(gameInfo) {
	this.init(gameInfo);
}

var p = Game.prototype;

p._defaultBrowser = "chrome";

p._path = null;

p._Stn = "";

p._No = null;

p._startTime = null;

p._endTime = null;

p._pid = null;

p._name = null;

p._gameCategory = null;

p._isRunningHttpReturn = true;

p._hasCallStop = false;

p._results = {
	Stn: "",
	StartTime:"",
	EndTime:"",
	GameNo:"",
	Score1:"",
	Score2:"",
	Score3:""
}


//localGameConfig:game:{name:"xx",path:"xx"}
p.init = function(gameInfo) {
	
		//console.log(this.startTime);
	this._path = gameInfo.gamePath;
	this._No = gameInfo.gameNo;
	this.setName(gameInfo.gamePath);
	

}

/**
update the accordding to the main loop which is written in the main.js
gameInfo: the game information from the server
{
 name: "xx",	
 operate: "run/stop"
}
*/

p.update = function(updateInfo) {
	var game = this;

    var status = updateInfo.gameStatus;
    this._path = updateInfo.gamePath;
    this._No = updateInfo.gameNo;
    this._Stn = updateInfo.gameStn;
    this.setName(updateInfo.gamePath);

	async.series({
		isRunning: function(callback) {
			game.isRunning(game._name, callback);
		},
	}, function(err, results) {
		console.log(results);
		if (results.isRunning == true) {
			//if game information`s operation from server is end or stop
			if (status == '0') {
				//game.killProcessByPid(game._pids[0]);
				game.stop(game._name);
				console.log("go to stop game");
			}

		} else {
			//if game information`s operation from server is run 
			//if game is not running then run it 
			console.log(game._gameCategory)
			console.log(game._path)

			if (status == '1') {

				this._startTime = new Date().toString() //.replace(/T/,' ').replace(/\..+/,'');

				//if game category is the web game (cycling game)
				if (game._gameCategory == "web") {
					console.log("run...........................")
					var gamePoint = open(game._path, game._defaultBrowser);
				} else {
					var exec = require('child_process').execFile;
					console.log("start game");
					var child = exec(game._path, function(err, data) {
						console.log(err)
						console.log(data.toString());
					});
				}

			}else if(status == '0'){
				if(game.getResults()!=false){
					setTimeout(function(){
						game.sendMessage(game.getResults());
					},3000);
					
				}
				
			}

		}
	});
}

//start or run the app(game) 
p.isRunning = function(name, callback) {
	var game = this;

	if (game._isRunningHttpReturn == false) {
		return;
	}

	if (this._gameCategory == "web") {
		name = game._defaultBrowser;
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
			//async.series({
			// 	gameStatus: function(callback) {
			// 		game._isRunningHttpReturn = false;
			// 		game.getInfoByHttp(game, "", callback);
			// 	}
			// }, function(err, results) {
			// 	game._isRunningHttpReturn = true;
			// 	if (results.gameStatus.gameStatus == "null") {
			// 		callback(null, false);
			// 	}
			// 	if (results.gameStatus.gameStatus == "running") {
			// 		callback(null, true);
			// 	}
			// });

	} else {
		// async.series({
		// 	pids: function(callback) {
		// 		game.getProcessPidByName(name, callback);
		// 	},
		// }, function(err, results) {
		// 	if (results.pids.length != 0) {
		// 		game._pids = results.pids;
		// 		callback(null, true);
		// 	} else {
		// 		callback(null, false);
		// 	}
		// })
		var sharedata = game.getShareJson();
		var isRunning = sharedata.IsRunning;
		if(isRunning == "true"){
			callback(null,true);
		}else{
			callback(null,false);
		}
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
 * [killAppByName description]
 * @param  {string} name game name
 * @return {[type]}      [description]
 */
p.killAppByName = function(name) {
	var game = this;
	async.series({
		pids: function(callback) {
			game.getProcessPidByName(name, callback);
		}
	}, function(err, results) {
		if (results.pids.length != 0) {
			$.each(results.pids, function(index, value) {
				game.killProcessByPid(value);
			});
		}
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
	 * return game path
	 * @return {string} game path
	 */
p.getPath = function() {
	return this._path;
}


p.setName= function(gamePath){
	//if game path is the http url then the game category is the web game
	if (/http/.test(gamePath)) {
		this._gameCategory = "web";
		//if the game path is the execute application then the game category is the local executale game
	} else {
		//console.log(gamePath)
		this._name = gamePath.split("/").pop();
		console.log(this._name)
		this._gameCategory = "exe"
	}
}

/**
 * stop the game
 * @return {null}
 */
p.stop = function(name) {
	var game = this;
	//pre work 
	async.series({
		prework: function(callback) {
			if (game._gameCategory == "web") {
				//game.getInfoByHttp(game, "&operate=stop", callback);
				name = "chrome";
				game.killAppByName(name);
				callback(null, "done");
			} else {
				if(game._hasCallStop == false){
					game.callStopGameByLocalFile(callback);
				}		
			}
			// game.killAppByName(name);
		}
	}, function(err, results) {
		if (err) {
			console.log(err);
		}
		// game._results.StartTime = results.prework.StartTime;
		// game._results.EndTime = results.prework.EndTime;
		// game._results.Score1 = results.prework.Score1;
		// game._results.Score2 = results.prework.Score2;
		// game._results.Score3 = results.prework.Score3;
		// game.sendMessage(game._results);
	
	});
}

p.sendMessage = function(results) {
	$.post( "http://220.246.72.77/pms/cmd/result.php", results).done(function( data ) {
	    if(data == "0") {
	    	alert( "Send results success!");
	    }
	    else{
	    	alert( "Send results failed, return:" + data );
	    }
	    
	  });
}

p.getResults = function(){
	var results = this.getShareJson();
		this._results.StartTime = results.StartTime;
		this._results.EndTime = results.EndTime;
		this._results.Stn = this._Stn;
		this._results.GameNo = this._No;
		this._results.Score1 = results.Score1;
		this._results.Score2 = results.Score2;
		this._results.Score3 = results.Score3;
		if(results.IsSendResults == "false"){
			results.IsSendResults = "true";
			var outputFilename = process.cwd()+"\\share.json";
			fs.writeFile(outputFilename, JSON.stringify(results), function(err) {
				if (err) {
					console.log(err);
					alert("Please make sure you have the permisison to write file in the local file system. If not,try to get the permission.");
				} else {
					console.log("JSON saved to " + outputFilename);
					// if(shareObject.IsRunning == "false"){
					// 	callback(null,shareObject);
					// }
					

				}
			});
		}else{
			return false;
		}
		

		console.log(this._results);
		return this._results;
}
/**
 *Stop game through the local file
 */
p.callStopGameByLocalFile = function(callback) {
	console.log(this.getPath());
	var gameLocalFilePath = this.getPath().replace(/[^\/]*$/,"").replace(/\//g,"\\");
	console.log(gameLocalFilePath);
	var fs = require('fs');


	// var sharedata = {
	// 	Name:"PsychologeGame",
	// 	IsRunning:"false",
	// 	Operate:"",
	// 	StartTime:"2015/2/9 0:00:00",
	// 	EndTime:"2015/2/9 0:00:00",
	// 	GameNo:"2",
	// 	Score1:"",
	// 	Score2:"",
	// 	Score3:""
	// }

    
	//var outputFilename = gameLocalFilePath + 'share.json';
	var outputFilename = process.cwd()+"\\share.json"
	//var outputFilename = 'F:\\share.json';

	//this.checkPermission (outputFilename, 2, cb);
	var shareObject = this.readJsonFile(outputFilename);

	console.log(shareObject);

	

	if(shareObject.Operate == ""){
		if(shareObject.IsRunning == "false"){
				callback(null,shareObject);
				return;
		}
		shareObject.Operate = "stop";
		fs.writeFile(outputFilename, JSON.stringify(shareObject), function(err) {
			if (err) {
				console.log(err);
				alert("Please make sure you have the permisison to write file in the local file system. If not,try to get the permission.");
			} else {
				console.log("JSON saved to " + outputFilename);
				// if(shareObject.IsRunning == "false"){
				// 	callback(null,shareObject);
				// }
				

			}
		});
	}
	
	// fs.writeFile(outputFilename, JSON.stringify(shareObject, null, 4), function(err) {
	// 	if (err) {
	// 		console.log(err);
	// 		alert("Please make sure you have the permisison to write file in the local file system. If not,try to get the permission.");
	// 	} else {
	// 		console.log("JSON saved to " + outputFilename);

	// 	}
	// });
	
}

p.getShareJson = function() {
	var outputFilename = process.cwd()+"\\share.json"
	//var outputFilename = 'F:\\share.json';

	//this.checkPermission (outputFilename, 2, cb);
	return this.readJsonFile(outputFilename);
}

/**
 * change permission
 */
// p.checkPermission = function (file, mask, cb){
//     fs.stat (file, function (error, stats){
//         if (error){
//             cb (error, false);
//         }else{
//             cb (null, !!(mask & parseInt ((stats.mode & parseInt ("777", 8)).toString (8)[0])));
//         }
//     });
// };

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

//read json file by path
p.readJsonFile = function(path) {
	return $.parseJSON(fs.readFileSync(path, "utf-8"));
};