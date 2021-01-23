const { MessageAttachment } = require('discord.js');

module.exports = {
    name: "commands.avatar.name",
    aliases: ["pfp", "icon"],
    description: "commands.avatar.description",
    usage: "commands.avatar.usage",
    member: true,
    cooldown: 5,
	execute(client, message, args) {

        const content = client.translateData.commands.avatar;

        if (!args.length) {
            const avatarUrl = message.author.displayAvatarURL();
            const attachment = new MessageAttachment(avatarUrl);

            return message.channel.send(attachment);
        }

        if (!message.mentions.users.size) {
            return message.reply(content.error_content_1)
        }

        if (message.mentions.users.size > 1) {
            return message.reply(content.error_content_2)
        }

        const taggedUser = message.mentions.users.first();
        const attachment = new MessageAttachment(taggedUser.displayAvatarURL());

        return message.channel.send(attachment);

	}
};