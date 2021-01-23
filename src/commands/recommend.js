const { MessageEmbed } = require("discord.js");
const { getRecommendationEmbed } = require("../utils");

module.exports = {
    name: "commands.recommend.name",
    description: "commands.recommend.description",
    usage: "commands.recommend.usage",
    member: true,
    guildOnly: true,
    cooldown: 1,
	execute: async (client, message, args) => {

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

        var data = {
            author: {username: name, id: message.author.id},
            title: title,
            url: link,
            description: description
        }
        var recommendEmbed = getRecommendationEmbed(client, data);
        var recommended = false;

        // If has api, send request to add recommendation
        if (client.config.apiURL.length) {
            try {
                var url = `${client.config.apiURL}/recommendations`;

                await client.axios.post(url, data).then((response) => {
                    if (response.data.success) {
                        recommendEmbed = getRecommendationEmbed(client, response.data.recommendation);
                        recommended = true;
                    }
                }).catch((e) => {
                    console.log(e);
                });
            } catch (e) {
                console.log(e);
            }
        } else {
            recommended = true;
        }

        if (!recommended) {
            return message.reply(client.translateData.index.error_something_went_wrong);
        }

        const channel = client.guild.channels.cache.find(channel => channel.id == client.config.channels.materialsChannelID);
        channel.send(recommendEmbed);
	}
};