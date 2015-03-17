;
var async = require("async");
var open = require("open");
var http = require("http");
var jsonpatch = require('fast-json-patch');

//game class
function Game(gameInfo, weblink) {
	console.log("init game");
	this.init(gameInfo, weblink);
}

var p = Game.prototype;

p._defaultBrowser = "chrome";

p._webLinkResults = '';

p._path = null;

p._Stn = "";

p._Pno = "";

p._Glevel = null;

p._No = null;

p._startTime = null;

p._endTime = null;

p._pid = null;

p._name = null;

p._gameCategory = null;

p._isRunningHttpReturn = true;

p._hasCallStop = false;

p._isDisposed = false;

p.isStartting = false;

p._results = {
	Stn: "",
	Pno: "",
	StartTime: "",
	EndTime: "",
	GameNo: "",
	Glevel: "",
	Score1: "",
	Score2: "",
	Score3: ""
}

/**
 * [init game initialize]
 * @param  {object} gameInfo game information
 * @return none
 */
p.init = function(gameInfo, weblink) {
	//console.log(this.startTime);
	this._path = gameInfo.GamePath;
	this._No = gameInfo.GameNo;
	this._Pno = gameInfo.Pno;
	this._Glevel = gameInfo.Glevel;
	this._webLinkResults = weblink;
	this.setName(gameInfo.GamePath);

	//init sharedata file
	this.initShareData();
}


/**
 * [initShareData init the sharedata json file]
 * @return {[type]} [description]
 */
p.initShareData = function() {
	var initObjectData = {
			Name: "", //Game name
			Pno: this._Pno, //Player No
			Glevel: this._Glevel, //Game level
			IsRunning: "false", //Game is running
			Operate: "", //Game operate   run | stop
			StartTime: "", //Game start time
			EndTime: "", //Game end time
			GameNo: "", //Game No
			IsSendResults: "", //Whether result has send after game ended
			Score1: "", //Game score1
			Score2: "", //Game score2
			Score3: "", //Game score3
		}
		//parameters: objectdata | callback
	this.writeShareDataFile(initObjectData, null);
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

	var status = updateInfo.Status;
	this._path = updateInfo.GamePath;
	this._No = updateInfo.GameNo;
	this._Stn = updateInfo.Stn;
	this.setName(updateInfo.GamePath);

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
			//console.log(game._gameCategory)
			//console.log(game._path)

			if (status == '1') {

				this._startTime = new Date().toString() //.replace(/T/,' ').replace(/\..+/,'');

				//if game category is the web game (cycling game)
				if (game._gameCategory == "web") {
					console.log("run...........................")
					var gamePoint = open(game._path, game._defaultBrowser);
				} else {
					if (game.isStartting == false) {
						game.isStartting = true;
						var exec = require('child_process').execFile;
						console.log("start game");
						var child = exec(game._path, function(err, data) {
							console.log(err)
							console.log(data.toString());
							game.isStartting = false;
						});
					}
				}

			} else if (status == '0') {
				var results = game.getResults();
				if (results != false) {
					setTimeout(function() {
						game.sendMessage(results);
					}, 3000);
				}
			}
		}
	});
}

/**
 * Check whether the game is running or not
 * @param  {string}   name     the game`s name
 * @param  {Function} callback async callback
 * @return {Boolean}           true or false
 */
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

		if (sharedata == null) return;

		var isRunning = sharedata.IsRunning;
		if (isRunning == "true") {
			callback(null, true);
		} else {
			callback(null, false);
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


p.setName = function(gamePath) {
	//alert(gamePath);//gamePath = gamePath.toString();
	//if game path is the http url then the game category is the web game
	if (/http/.test(gamePath)) {
		this._gameCategory = "web";
		//if the game path is the execute application then the game category is the local executale game
	} else {
		//console.log(gamePath)
		this._name = gamePath.split("/").pop();
		//console.log(this._name)
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
				if (game._hasCallStop == false) {
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

p.dispose = function() {
	console.log("set game dispose")
	this._isDisposed = true;
}

p.sendMessage = function(results) {
	var game = this;
	console.log("游戏停止后，发送的游戏结果数据:");
	console.log(results);
	$.post(this._webLinkResults, results).done(function(data) {
		if (data == "0") {
			//alert("Send results success!");

			$(".message-box").html('Results sent success!').css("color", "#0BBF18").fadeIn();
			setTimeout(function() {
				$(".message-box").fadeOut();
			}, 3000);
		} else {
			//alert("Send results failed, return:" + data);
			$(".message-box").html('Results sent fail!').css("color", "red").fadeIn();
			setTimeout(function() {
				$(".message-box").fadeOut();
			}, 3000);
		}
		console.log("go to dispose")
		//销毁销毁这个游戏，dispose the game
		game.dispose();

	});
}

p.getResults = function() {
	//get sharedata file data
	var results = this.getShareJson();

    if(results == null) return;

	this._results.Pno = this._Pno;
	this._results.Glevel = this._Glevel;
	this._results.StartTime = results.StartTime;
	this._results.EndTime = results.EndTime;
	this._results.Stn = this._Stn;
	this._results.GameNo = this._No;
	this._results.Score1 = results.Score1;
	this._results.Score2 = results.Score2;
	this._results.Score3 = results.Score3;

	if (results.IsSendResults == "false") {
		results.IsSendResults = "true";
		var outputFilename = process.cwd() + "\\share.json";
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
	} else {
		return false;
	}
	
	return this._results;
}

/**
 *Stop game through the local file
 */
p.callStopGameByLocalFile = function(callback) {
	console.log(this.getPath());
	var gameLocalFilePath = this.getPath().replace(/[^\/]*$/, "").replace(/\//g, "\\");
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
	var outputFilename = process.cwd() + "\\share.json"
		//var outputFilename = 'F:\\share.json';

	//this.checkPermission (outputFilename, 2, cb);
	var shareObject = this.readJsonFile(outputFilename);

	if(shareObject == null) {
		alert("sharedata empty");
		return;
	}

	console.log("停止游戏之前，获取的sharedata数据：");
	console.log(shareObject);

	if (shareObject.Operate == "") {
		if (shareObject.IsRunning == "false") {
			callback(null, shareObject);
			return;
		}
		shareObject.Operate = "stop";
		fs.writeFile(outputFilename, JSON.stringify(shareObject), function(err) {
			if (err) {
				console.log(err);
				alert("Please make sure you have the permisison to write file in the local file system. If not,try to get the permission.");
			} else {
				console.log("JSON saved to " + outputFilename);
				callback(null, shareObject);
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

/**
 * [writeShareDataFile write sharedata file]
 * @return {[type]} [description]
 */
p.writeShareDataFile = function(objectData, callback) {

	var outputFilename = process.cwd() + "\\share.json";

	fs.writeFile(outputFilename, JSON.stringify(objectData), function(err) {
		if (err) {
			console.log(err);
			alert("Please make sure you have the permisison to write file in the local file system. If not,try to get the permission.");
		} else {
			console.log("JSON saved to " + outputFilename);
		}
	});

}

p.getShareJson = function() {
	var outputFilename = process.cwd() + "\\share.json"

	//alert(outputFilename);
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

/**Deprecated
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
			//console.log(body);
			callback(null, JSON.parse(body));
		});

	}).on('error', function(e) {
		console.log(e);
	});
}

//read json file by path
p.readJsonFile = function(path) {
	var data = fs.readFileSync(path, "utf-8");
	if (data == "") {
		data = null;
		console.log("Share data file return empty string");
	}
	return $.parseJSON(data);
};