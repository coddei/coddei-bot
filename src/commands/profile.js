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
            const url = `${client.config.apiURL}/discord/members/${message.author.id}`;
            await client.axios.get(url).then((response) => {
                if (response.data.success) {
                    profileEmbed = getProfileEmbed(client, response.data.user);
                }
            }).catch((e) => {
                console.log(e);
            });

            if (!profileEmbed) {
                return message.reply(content.error_content_4);
            }

            return message.channel.send(profileEmbed);
        }

        options = ["nick", "github", "portfolio", "bio"];

        if (!message.mentions.users.size && !options.includes(args[0])) {
            return message.reply(content.error_content_2)
        }

        if (message.mentions.users.size > 1) {
            return message.reply(content.error_content_3)
        }

        if (options.includes(args[0])) {
            const url = `${client.config.apiURL}/discord/members/${message.author.id}`;
            await client.axios.put(url, {args[0]: args.slice(1).join(" ")}).then((response) => {
                if (response.data.success) {
                    return message.reply(content.response_content_1)
                }
                return message.reply(content.error_content_5)
            }).catch((e) => {
                console.log(e);
            });            
        }

        const taggedUser = message.mentions.users.first();
        const url = `${client.config.apiURL}/discord/members/${taggedUser.id}`;
        await client.axios.get(url).then((response) => {
            if (response.data.success) {
                profileEmbed = getProfileEmbed(client, response.data.user);
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