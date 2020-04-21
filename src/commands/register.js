
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "commands.register.name",
    description: "commands.register.description",
    cooldown: 5,
	execute(client, message, args) {

        const content = client.translateData.commands.register;

        if (client.guild.roles.cache.find(role => role.id == client.config.memberRoleID)) {

            const registeredEmbed = new MessageEmbed()
                .setColor(client.config.accentColor)
                .setTitle(content.error_content_1)
                .setFooter(client.config.year + " © Coddei", client.config.logoURL);

            return message.reply(registeredEmbed);
        }

        const registerEmbed = new MessageEmbed()
            .setColor(client.config.accentColor)
            .setTitle(content.response_content_1)
            .setFooter(client.config.year + " © Coddei", client.config.logoURL);

        return message.author.send(registerEmbed);

	}
};