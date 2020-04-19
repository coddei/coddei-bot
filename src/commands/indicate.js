const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "commands.indicate.name",
    description: "commands.indicate.description",
    usage: "commands.indicate.usage",
    cooldown: 20,
	execute(client, message, args) {

        const content = client.translateData.commands.indicate;

        if (!args.length) {
            const warningEmbed = new MessageEmbed()
                .setColor("#0072FF")
                .setTitle(content.response_content_1)
                .setDescription(`${client.prefix}${content.name} ${content.usage}`)
                .addFields(
                    {name: "\u200B", value: `${content.response_content_2}`}
                )
                .setFooter(getYear() + ' © Coddei', 'https://i.imgur.com/jBdy5Zf.png');
            return message.reply(warningEmbed);
        }



	}
};