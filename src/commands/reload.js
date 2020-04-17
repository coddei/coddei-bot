module.exports = {
    name: "reload",
    admin: true,
    args: true,
    description: "commands.reload.description",
    usage: "commands.reload.usage",
	execute(message, args, data) {

        const content = data.commands.reload;

        if (!args.length) return message.channel.send(`${content.error_content_1}, ${message.author}!`);
        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName)
            || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        
        if (!command) return message.channel.send(`${content.error_content_2} \`${commandName}\`, ${message.author}!`);

        delete require.cache[require.resolve(`./${command.name}.js`)];

        try {
            const newCommand = require(`./${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);
        } catch (error) {
            console.log(error);
            message.channel.send(`${content.error_content_3} \`${command.name}\`:\n\`${error.message}\``);
        }

        message.channel.send(`${content.response_content_1} \`${command.name}\` ${content.response_content_2}`);
	}
};