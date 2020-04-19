const { MessageEmbed } = require("discord.js");
const { materialsChannel } = require("../../config.json");

module.exports = {
    name: "commands.indicate.name",
    description: "commands.indicate.description",
    aliases: ["indicate"],
    usage: "commands.indicate.usage",
    cooldown: 1,
	execute(client, message, args) {

        const content = client.translateData.commands.indicate;

        const infoEmbed = new MessageEmbed()
            .setColor("#0072FF")
            .setTitle(content.response_content_1)
            .setDescription(`**${client.prefix}${content.name}** ${content.usage}`)
            .addFields(
                {name: "\u200B", value: `${content.response_content_2}`}
            )
            .setFooter(client.year + " © Coddei", "https://i.imgur.com/jBdy5Zf.png");

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
            .setColor("#0072FF")
            .setTitle(`${content.response_content_3} » ${name}`)
            .addFields(
                {name: content.response_content_4, value: title},
                {name: content.response_content_5, value: link},
                {name: content.response_content_6, value: description}
            )
            .setFooter(client.year + " © Coddei", "https://i.imgur.com/jBdy5Zf.png")
            .setTimestamp();

        try {
            const channel = message.guild.channels.cache.find(channel => channel.id == materialsChannel);
            channel.send(postEmbed);
        } catch (error) {
            console.log(error);
        }

	}
};