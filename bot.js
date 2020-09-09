const fs = require('fs');
const Discord = require("discord.js");
const {
	prefix,
	token
} = require('./config.json');
const logger = require("./logger.js");

var t0 = process.hrtime();

//------command functionality--------

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands');

for (const file of commandFiles) {
	// require the command file
	const command = require(`./commands/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}

client.on('error', (e) => {
	logger.error(e);
});

//Check if there was a crash, try to print the stack and rename the file
client.on('ready', () => {	
	var timeInMilliseconds = process.hrtime(t0)[1]/1000000; // dividing by 1000000 gives milliseconds from nanoseconds
	logger.info("Startup took " + timeInMilliseconds + " milliseconds.");
	logger.info("Logged in as " + client.user.tag);

	fs.readFile("./logs/crash.log", (err, data) => {
		if(err) logger.warn("Could not read crash.log: " + err);
		else {
			try {
				var d = JSON.parse(data).stack;
			} catch(err) {
				logger.error("Could not parse crash.log: " + err);
				logger.info("Removing crash.log\n" + data);
				fs.unlink("./logs/crash.log", (err) => {
					if(err) logger.error("Could not remove crash.log:" + err);
					else logger.info("Removed crash.log");
					d = "Error parsing crash log";
				});
			}
			if(!d) d = "something went wrong :("
			client.channels.get("423839512666439692").send("Kaadoit botin, tässä pino: \n" + "```\n" + d + "```");
			let date = new Date().toISOString().replace(/:/g, "-");
			fs.rename("./logs/crash.log", "./logs/" + date + "-crash.log", function(err) {
				if (err) logger.error("Error renaming crash.log: " + err);			
			});
		}
	});
});

var vitunRegex = /(vitun[\s]bot)/;
var goodRegex = /(good[\s]bot)/;

client.on('message', message => {
	if(message.channel.id == "427803623892844544") {
		if(message.attachments.size <= 0) message.delete();	
		//giveCorgiMessageId -> DiscordAPIError: Cannot edit a message authored by another user				
		return;
	}		
	if (message.content.toLowerCase().match(goodRegex)) {
		replyHappy(message);
		return;
	}
	if (message.content.toLowerCase().match(vitunRegex)) {
		replySad(message);
		return;
	}
	if (!message.content.startsWith(prefix) || message.author.bot)
		return;			

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		 || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command)
		return;

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}
		return message.channel.send(reply);
	}

	try {
		command.execute(message, args, client);
	} catch (error) {
		logger.info("Could not execute a command: " + error);
		message.reply('fix your shit noob');
	}
});


client.login(token);

function replyHappy(message) {	
	var castroE = client.emojis.find("name", "castro").toString();
	var arr = [":)", ":3", ";^)", castroE];
	message.channel.send(arr[getRandomInt(arr.length)]);
}

function replySad(message) {
	var castroE = client.emojis.find("name", "castro").toString();
	var mullekoalatE = client.emojis.find("name", "mullekoalat").toString();
	var arr = [":(", mullekoalatE, ":3", "haluutko turpaas", "No ite vittu koodasit :D homo :Dd", castroE];	
	var reply = arr[getRandomInt(arr.length)]
	message.channel.send(reply);
	setTimeout(replyTurpaas, 500, message, reply);	
}

function replyTurpaas(message, reply) {
	if(reply == "haluutko turpaas") {		
		var listener;
		client.on("message", listener = function(msg) {			
			switch (msg.content) {
				case "en":				
					message.channel.send("saat silti");
					client.removeListener("message", listener);
					break;			
				case "homo":
					message.channel.send("ite oot");
					client.removeListener("message", listener);
					break;
				default:
					client.removeListener("message", listener);
			}
		});
	}
}

/*function giveCorgiMessageId() {
	var corgi_ch = client.channels.get("427803623892844544");        
        corgi_ch.fetchMessages({ limit: 2 })		
		.then(messages => {			
			let message_content = messages.last().content.split(" ");
			let id = Number.parseInt(message_content[message_content.length - 1]) + 1;			
			let new_content = message.content == "" ? id : " " + id;
			message.edit(new_content)
			.then(msg => logger.info(`Edited corgi message: ${msg}`))
			.catch(err => {logger.error(err); return "Ongelma muokatessa corgi viestiä";});			
		})
		.catch(err => {logger.error(err); return "Ongelma muokatessa corgi viestiä";});	
}*/

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}
