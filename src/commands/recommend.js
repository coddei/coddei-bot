const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "commands.recommend.name",
    description: "commands.recommend.description",
    usage: "commands.recommend.usage",
    cooldown: 1,
	execute(client, message, args) {

        const content = client.translateData.commands.recommend;

        const infoEmbed = new MessageEmbed()
            .setColor(client.config.accentColor)
            .setTitle(content.response_content_1)
            .setDescription(`**${client.config.prefix}${content.name}** ${content.usage}`)
            .addFields(
                {name: "\u200B", value: `${content.response_content_2}`}
            )
            .setFooter(client.config.year + " © Coddei", client.config.logoURL);

        if (!args.length) {
            return message.reply(infoEmbed);
        }

        if (args.length <= 2) {
            return message.reply(content.error_content_1, infoEmbed);
        }

        const title = args[0];
        const link = args[1];
        const description = args.slice(2).join(" ");

        const linkRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

        if (!link.match(linkRegex)) {
            return message.reply(content.error_content_2, infoEmbed);
        }

        var name = message.member.nickname;
        if (!name) {
            name = message.member.displayName;
        }

        const postEmbed = new MessageEmbed()
            .setColor(client.config.accentColor)
            .setTitle(`${content.response_content_3} » ${name}`)
            .addFields(
                {name: content.response_content_4, value: title},
                {name: content.response_content_5, value: link},
                {name: content.response_content_6, value: description}
            )
            .setFooter(client.config.year + " © Coddei", client.config.logoURL)
            .setTimestamp();

        try {
            const channel = client.guild.channels.cache.find(channel => channel.id == client.config.channels.materialsChannelID);
            channel.send(postEmbed);
        } catch (error) {
            console.log(error);
        }

	}
};