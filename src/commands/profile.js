const { getProfileEmbed } = require("../utils");

module.exports = {
    name: "commands.profile.name",
    description: "commands.profile.description",
    usage: "commands.profile.usage",
    guildOnly: true,
    cooldown: 15,
	execute: async (client, message, args) => {

        const content = client.translateData.commands.profile;

        if (!client.config.apiURL.length) {
            return message.reply(content.error_content_1);
        }

        var profileEmbed = null;

        if (!args.length) {
            console.log(message.author.id);
            const url = `${client.config.apiURL}/discord/members/${message.author.id}`;
            await client.axios.get(url).then((response) => {
                if (response.data.success) {
                    profileEmbed = getProfileEmbed(client, JSON.parse(response.data.user));
                }
            }).catch((e) => {
                console.log(e);
            });

            if (!profileEmbed) {
                return message.reply(content.error_content_4);
            }

            return message.channel.send(profileEmbed);
        }

        if (!message.mentions.users.size) {
            return message.reply(content.error_content_2)
        }

        if (message.mentions.users.size > 1) {
            return message.reply(content.error_content_3)
        }

        const taggedUser = message.mentions.users.first();
        console.log(taggedUser.id);

        const url = `${client.config.apiURL}/discord/members/${taggedUser.id}`;
        await client.axios.get(url).then((response) => {
            if (response.data.success) {
                profileEmbed = getProfileEmbed(client, JSON.parse(response.data.user));
            }
        }).catch((e) => {
            console.log(e);
        });

        if (!profileEmbed) {
            return message.reply(content.error_content_4);
        }        

        return message.channel.send(profileEmbed);

	}
};