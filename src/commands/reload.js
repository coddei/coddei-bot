const { find } = require("../utils");

module.exports = {
    name: "commands.reload.name",
    admin: true,
    args: true,
    description: "commands.reload.description",
    usage: "commands.reload.usage",
	execute(client, message, args) {

        const content = client.translateData.commands.reload;

        if (!args.length) return message.channel.send(`${content.error_content_1}, ${message.author}!`);
        const commandName = args[0].toLowerCase();
        const command = client.commands.get(commandName)
            || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        
        if (!command) return message.channel.send(`${content.error_content_2} \`${commandName}\`, ${message.author}!`);

        const commandNameTranslated = find(command.name, client.translateData);

        try {
            const jsCommandName = command.name.split(".")[1];
            delete require.cache[require.resolve(`./${jsCommandName}.js`)];

            const newCommand = require(`./${jsCommandName}.js`);
            client.commands.set(find(newCommand.name, client.translateData), newCommand);
        } catch (error) {
            console.log(error);
            message.channel.send(`${content.error_content_3} \`${commandNameTranslated}\`:\n\`${error.message}\``);
        }

        message.channel.send(`${content.response_content_1} \`${commandNameTranslated}\` ${content.response_content_2}`);
	}
};