const fs = require("fs");

const Discord = require("discord.js");

const { prefix, token, defaultRole } = require("../config.json");
const { find, getTranslateData } = require("./utils");

const client = new Discord.Client();

const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();

const translateData = getTranslateData();
const data = translateData.index;

const commandFiles = fs.readdirSync("src/commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(find(command.name, translateData), command);
}

client.on("ready", () => {
    console.log(`${data.console_login} ${client.user.tag}!`);

    client.user.setPresence({
        status: "online",
        activity: {
            "name": "!help | coddei.com"
        }
    })
});

client.on("message", message => {

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    if (command.admin && !message.member.hasPermission("ADMINISTRATOR")) return;

    if (command.guildOnly && message.channel.type !== "text") {
        return message.reply(data.error_dm_command);
    }

    const commandNameTranslated = find(command.name, translateData);

    if (command.args && !args.length) {
        let reply = `${data.error_missing_args}, ${message.author}!`;
        if (command.usage) {
        	reply += `\n${data.response_missing_args} \`${prefix}${commandNameTranslated} ${find(command.usage, translateData)}\``;
        }        
        return message.channel.send(reply);
    }

    if (!cooldowns.has(commandNameTranslated)) {
        cooldowns.set(commandNameTranslated, new Discord.Collection());
    }
    
    const now = Date.now();
    const timestamps = cooldowns.get(commandNameTranslated);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`${data.response_cooldown_1} ${timeLeft.toFixed(1)} ${data.response_cooldown_2} \`${commandNameTranslated}\` ${data.response_cooldown_3}`);
        }
    } else {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    try {
        command.execute(message, args, translateData);
    } catch (error) {
        console.error(error);
        message.reply(data.error_execute_command);
    }
});

client.on("guildMemberAdd", member => {
    role = member.guild.roles.cache.find(role => role.name == defaultRole);
    member.roles.add(role);
});

client.login(token);
