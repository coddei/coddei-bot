const fs = require("fs");

const Discord = require("discord.js");
const axios = require('axios')

const { MessageEmbed } = require("discord.js");

const { getYear, find, getTranslateData } = require("./utils");
const { isUserMember } = require("./permissions");

const config = require("../config.json");
const token = config.token;
config.year = getYear();
config.logoURL = "https://i.imgur.com/jBdy5Zf.png";
delete config.token;

const translateData = getTranslateData();
const data = translateData.index;

const client = new Discord.Client();

const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();
client.axios = axios;
client.config = config;
client.translateData = translateData;

const commandFiles = fs.readdirSync("src/commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(find(command.name, translateData), command);
}

client.on("ready", () => {
    const guild = client.guilds.cache.find(guild => guild.id == client.config.guildID);
    if (!guild) {
        console.log(data.console_no_guild);
        client.destroy();
        return;
    }
    client.guild = guild;

    console.log(`${data.console_login} ${client.user.tag}!`);

    client.user.setPresence({
        status: "online",
        activity: {
            "name": "!ajuda | coddei.com"
        }
    })
});

client.on("message", message => {

    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.admin && !message.member.hasPermission("ADMINISTRATOR")) return;

    if (command.member && !isUserMember(message.member, config)) {
        return message.reply(`${data.not_a_member} ${config.prefix}${find("commands.register.name", translateData)}`);
    }

    if (command.guildOnly && message.channel.type !== "text") {
        return message.reply(data.error_dm_command);
    }

    const commandNameTranslated = find(command.name, translateData);

    if (command.args && !args.length) {
        let reply = `${data.error_missing_args}, ${message.author}!`;
        if (command.usage) {
        	reply += `\n${data.response_missing_args} \`${config.prefix}${commandNameTranslated} ${find(command.usage, translateData)}\``;
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

        if (now < expirationTime && !config.devMode) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`${data.response_cooldown_1} ${timeLeft.toFixed(1)} ${data.response_cooldown_2} \`${commandNameTranslated}\` ${data.response_cooldown_3}`);
        }
    } else {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    try {
        command.execute(client, message, args);
    } catch (error) {
        console.error(error);
        message.reply(data.error_execute_command);
    }
});

// Actions for new member
client.on("guildMemberAdd", member => {
    // Ignore on devMode active
    if (config.devMode) return;

    // Add default role
    role = member.guild.roles.cache.find(role => role.id == config.roles.defaultRoleID);
    member.roles.add(role);

    // Ping member on dm
    try {
        member.send(
            new MessageEmbed()
                .setColor(config.accentColor)
                .setTitle(translateData.index.welcome_title)
                .setDescription(translateData.index.welcome_description.replace("<prefix>", config.prefix))
                .setFooter(config.year + " © Coddei", config.logoURL)
        );
    } catch(e) {
        console.log(e);
    }
});

client.login(token);
