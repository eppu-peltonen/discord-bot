
const fs = require('fs');
var waitingList = {};
var leaderboard;
const logger = require("../logger.js");

function add(id) {
	waitingList[id].time.seconds++;
	if (waitingList[id].time.seconds >= 60) {
		waitingList[id].time.seconds = 0;
		waitingList[id].time.minutes++;
		if (waitingList[id].time.minutes >= 60) {
			waitingList[id].time.minutes = 0;
			waitingList[id].time.hours++;
		}
	}

	waitingList[id].clock = (waitingList[id].time.hours ? (waitingList[id].time.hours > 9 ? waitingList[id].time.hours : "0" + waitingList[id].time.hours) : "00") + ":" +
	(waitingList[id].time.minutes ? (waitingList[id].time.minutes > 9 ? waitingList[id].time.minutes : "0" + waitingList[id].time.minutes) : "00") + ":" +
	(waitingList[id].time.seconds > 9 ? waitingList[id].time.seconds : "0" + waitingList[id].time.seconds);

	timer(id);
}
function timer(id) {
	waitingList[id].timer = setTimeout(add, 1000, id);
}

function start(id) {
	waitingList[id] = {
		timer: undefined,
		time: {
			seconds: 0,
			minutes: 0,
			hours: 0
		},
		clock: ""
	};
	if (leaderboard[id] == undefined)
		leaderboard[id] = "00:00:00";
	timer(id);
}

function stop(id) {
	clearTimeout(waitingList[id].timer);
}

function clear(id) {
	delete waitingList[id];
}

function sortLeaderboard() {
	var arr = [];
	for (var id in leaderboard) {
		arr.push({
			[id]: leaderboard[id]
		});
	}
	var re = /:/g;
	var newArr = arr.sort(function (a, b) {
			var timeA = parseInt(Object.values(a)[0].replace(re, ""));
			var timeB = parseInt(Object.values(b)[0].replace(re, ""));
			return timeB - timeA;
		});
	return newArr;
}

function writeTime(id) {
	if(id == undefined) {logger.warn("Error writing time to leaderboard_KO.json: id was undefined"); return;}
    if (leaderboard[id] == undefined) leaderboard[id] = "00:00:00";
	var temp = JSON.parse(JSON.stringify(leaderboard));
	var timeBefore = leaderboard[id].split(":");	
	var seconds = parseInt(timeBefore[2]) + waitingList[id].time.seconds;
	var minutes = parseInt(timeBefore[1]) + waitingList[id].time.minutes;
	var hours = parseInt(timeBefore[0]) + waitingList[id].time.hours;
	if (seconds >= 60) {
		minutes++;
		seconds = seconds - 60
	}
	if (minutes >= 60) {
		hours++;
		minutes = minutes - 60;
	}
	var timeAfter = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" +
	(minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" +
	(seconds > 9 ? seconds : "0" + seconds);	
	temp[id] = timeAfter;			
	fs.writeFile('./leaderboards/leaderboard_KO.json', JSON.stringify(temp), (err) => {
		if (err) logger.error(err);		
		else logger.info("Wrote " + JSON.stringify(temp) + " to leaderboard_KO.json");
	});
}

function clockFormat(id) {
	var output="";
	var splitClock = waitingList[id].clock.split(':', 3);	
	let hours = splitClock[0][0] == '0' ? splitClock[0][1] : splitClock[0];
	let minutes = splitClock[1][0] == '0' ? splitClock[1][1] : splitClock[1];
	let seconds = splitClock[2][0] == '0' ? splitClock[2][1] : splitClock[2];
	hours = Number.parseInt(hours) > 0 ? hours : "00";
	minutes = Number.parseInt(minutes) > 0 ? minutes : "00";
	
	output = hours == "00" ? (minutes == "00" ? seconds + " sekuntia" : minutes + " minuuttia " + seconds + " sekuntia") : 
	(hours + " tuntia " + minutes + " minuuttia " + seconds + " sekuntia");	
	return output;
}

function showLeaderboard(message, client) {
	var arr = sortLeaderboard();
	var embed = {
		"title": "**Ketaootetaan Leaderboard**",
		"fields": []
	};

	for (let i = 0; i < arr.length; i++) {
		let id = Object.keys(arr[i])[0];
		var username = "";
		try {
			username = client.users.get(id).username;
		} catch (err) {logger.error(err);}
		if (!username) username = "User not found";

		embed["fields"].push({
			"name": "#" + (i + 1),
			"value": username + " - " + Object.values(arr[i])[0]
		});
	}	
	message.channel.send({embed});
	return;
}

function status(message, client) {
	var statusList = [];
	if (!Object.keys(waitingList).length > 0 ) {		        	
		message.channel.send("Ketään ei ooteta.");
	}		        
	else {
		Object.keys(waitingList).forEach(id => {statusList.push(client.users.get(id).username)});
		message.channel.send("Seuraavia henkilöitä odotetaan: \n \n" + statusList.join('\n').toString());
	}	        
}

function handle_KO(mentioned_users, message, client) {
	for(let [snowflake, user] of mentioned_users) {				
		let id = snowflake;				
		if (user.voiceChannel !== undefined && message.member.voiceChannel.id == user.voiceChannel.id) {			
			message.channel.send(user.user.username + " on jo kanavalla");
			continue;
		}
		if (waitingList[id]) {
			message.channel.send("henkilöä " + user.user.username + " ootetaan jo");
			continue;
		}
		start(id);
		var interval = setInterval(function () {
				writeTime(id);
			}, 60000);
		var listener;

		client.on('voiceStateUpdate', listener = (oldMember, newMember) => {
			logger.info("[EVENT] voiceStateUpdate");
			let newUserChannel = newMember.voiceChannel;
			let oldUserChannel = oldMember.voiceChannel;
			if (oldUserChannel === undefined && newUserChannel !== undefined) {
				if (newUserChannel.members.get(id)) {
					stop(id);					
					message.channel.send("henkilöä " + user.user.username + " ootettiin joku " + clockFormat(id));
					clearInterval(interval);
					writeTime(id);
					clear(id);
					client.removeListener("voiceStateUpdate", listener);
				}
			}
		});
	}
}


module.exports = {
	name: 'ketaootetaan',
	description: 'KETÄ OOTETAAN?',
	aliases: ["ke"],
	usage: "[user]",
	execute(message, args, client) {
		fs.readFile("./leaderboards/leaderboard_KO.json", (err, data) => {
			if (err) logger.error("Error reading leaderboard_KO.json: " + err);
			logger.info("Read file leaderboard_KO.json");
			try {
				leaderboard = JSON.parse(data);
			} catch(err) {logger.error("Error parsing leaderboard_KO.json: " + err);}
			
			if (args == "leaderboard") {showLeaderboard(message, client); return;}		
			if (args == "status") {status(message, client); return;}

			var mentioned_users = message.mentions.members;
			
			if (!mentioned_users) {
				logger.info("Could not parse users from Ketaootetaan command: " + message.content);
				message.channel.send("ei sitä komentoa noin käytetä");
				return;
			}
			handle_KO(mentioned_users, message, client);
		});
	},
};
