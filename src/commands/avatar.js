const { MessageAttachment } = require('discord.js')

module.exports = {
    name: "avatar",
    aliases: ["pfp", "icon"],
    description: "commands.avatar.description",
    usage: "commands.avatar.usage",
    cooldown: 5,
	execute(message, args, data) {

        const content = data.commands.avatar;

        if (!args.length) {
            const avatarUrl = message.author.displayAvatarURL();
            const attachment = new MessageAttachment(avatarUrl);

            return message.channel.send(attachment);
        }

        if (!message.mentions.users.length) {
            return message.reply(content.error_content_1)
        }

        const taggedUser = message.mentions.users.first();
        const attachment = new MessageAttachment(taggedUser.displayAvatarURL());

        return message.channel.send(attachment);

	}
};