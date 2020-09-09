module.exports = {
    name: 'avatar',
    description: 'outputs your avatar',
    aliases: ['icon'],
    execute(message, args) {
        message.reply(message.author.avatarURL);
    },
};