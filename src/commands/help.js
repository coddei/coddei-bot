const { find } = require("../utils");

module.exports = {
	name: "commands.help.name",
	description: "commands.help.description",
	aliases: ["commands"],
    usage: "commands.help.usage",
	cooldown: 5,
	execute(client, message, args) {
        const response = [];
        const { commands } = message.client;
        
        const content = client.translateData.commands.help;

        if (!args.length) {
            response.push(content.message_content_1);
            response.push(commands.map(command => { if (!command.admin) return find(command.name, client.translateData); }).join(", "));
            response.push(`\n${content.message_content_2} \`${client.prefix}help ${content.usage}\` ${content.message_content_3}`);
            
            return message.author.send(response, { split: true })
                .then(() => {
                    if (message.channel.type === "dm") return;
                    message.reply(content.response_content_1);
                })
                .catch(error => {
                    console.error(`${content.console_content_1} ${message.author.tag}.\n`, error);
                    message.reply(content.error_content_1);
                });
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply(content.error_content_2);
        }

        response.push(`${content.response_content_2} ${find(command.name, client.translateData)}`);

        if (command.aliases) response.push(`${content.response_content_3} ${command.aliases.join(", ")}`);
        if (command.description) response.push(`${content.response_content_4} ${find(command.description, client.translateData)}`);
        if (command.usage) response.push(`${content.response_content_5} ${client.prefix}${find(command.name, client.translateData)} ${find(command.usage, client.translateData)}`);

        response.push(`${content.response_content_6} ${command.cooldown || 3} ${content.response_content_7}`);

        message.channel.send(response, { split: true });
	}
};