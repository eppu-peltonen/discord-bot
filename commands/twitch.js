const fetch = require('node-fetch');
const twitchClientID = "i5wia3qcsuevs5xv98u1bf4tc8ytng";
const logger = require("../logger.js");

	//Hakee annetun striimaajan
function getStreamer(twitchUser) {
	var streams = "https://api.twitch.tv/kraken/streams/" + twitchUser;
	var myInit = {
		method: "GET",
		headers: {
			"Client-ID": twitchClientID
		}
	};
	return fetch(streams, myInit)
	.then(
		function (response) {
			var embed;		
			return response.json()
			.then(json => {
				if (response.ok && json["stream"] != null) {
					logger.info("Fetched twitch stream: " + twitchUser);
					var link = json["stream"]["channel"]["url"];
					var game = json["stream"]["game"];
					var status = json["stream"]["channel"]["status"];
					var displayName = json["stream"]["channel"]["display_name"];
					var logo = json["stream"]["channel"]["logo"];				

					embed = {
						"title": game,
						"description": status, 
						"url": link,
						"color": 7032241,    
						"thumbnail": {
							"url": logo
						},
						"author": {
							"name": displayName,
							"url": link					
						}
					};

					return embed;
				} else if (json["stream"] == null && json["_links"] != null) {
					var name = json["_links"]["self"].split("/");
					return getChannel(name[name.length - 1]);
				} else {
					return Promise.reject(Object.assign({}, json, {
							status: response.status,
							statusText: response.statusText
						}))
				}
			})
	});
}

//Hakee annetun twitch kanavan
function getChannel(twitchUser) {
	var channels = "https://api.twitch.tv/kraken/channels/" + twitchUser;
	var myInit = {
		method: "GET",
		headers: {
			"Client-ID": twitchClientID
		}
	};
	return fetch(channels, myInit)
	.then(
		function (response) {
		var textResponse;
		return response.json()
		.then(json => {
			if (response.ok && json["display_name"]) {
				logger.info("Fetched twitch channel: " + twitchUser);
				var link = json["url"];
				var displayName = json["display_name"];				
				var logo = json["logo"];
				var embed = {
					"description": displayName + " is offline",
					"url": link,
					"color": 7032241,					  
					"thumbnail": {
						"url": logo
					},
					"author": {
						"name": displayName,
						"url": link					
					}
				};
				return embed;
			} else {
				return Promise.reject(Object.assign({}, json, {
						status: response.status,
						statusText: response.statusText
					}))
			}
		})
	});
}

module.exports = {
	name: 'twitch',
	description: 'fetches twitch channel link and states whether the streamer is online or not',
	args: true,
	usage: "[twitchUser]",
	execute(message, args) {

		// Extract twitch user from command
		var sentence = message.content.split(' ');
		var twitchUser = sentence[1];

		getStreamer(twitchUser)
		.then(embed => {return message.channel.send({embed});})
		.catch(error => {
			logger.error(error);
			message.channel.send(error["message"])
		})
	},
};
