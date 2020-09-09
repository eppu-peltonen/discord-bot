const {
	prefix
} = require('../config.json');

module.exports = {
	name: 'help',
	description: 'List of commands',
	usage: '[command name]',
	execute(message, args) {
		const {
			commands
		} = message.client;
		const data = [];

		if (!args.length) {
			data.push('Commands:');
			data.push(commands.map(command => command.name).join(', '));
			data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command.`);
		} else {
			if (!commands.has(args[0])) {
				return message.reply('that\'s not a valid command!');
			}

			const command = commands.get(args[0]);

			data.push(`**Name:** ${command.name}`);

			if (command.description)
				data.push(`**Description:** ${command.description}`);
			if (command.aliases)
				data.push(`**Aliases:** ${command.aliases.join(', ')}`);
			if (command.usage)
				data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

		}

		message.channel.send(data, {
			split: true
		})
	},
};
