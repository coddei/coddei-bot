
const { MessageEmbed } = require("discord.js");
const { find } = require("../utils");

class CommandUseError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class TimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

const finishReaction = "☑️";

const collectMessage = (message, config, ms=60000) => {
    return new Promise((resolve, reject) => {
        const collector = message.author.dmChannel.createMessageCollector(
            (m) => message.author.id === m.author.id,
            { time: ms }
        );
        collector.on("collect", m => {
            if (m.content.startsWith(config.prefix) || m.author.bot) {
                return reject(new CommandUseError);
            }
            collector.stop();
        });
        collector.on("end", collected => {
            if (!collected.array().length) {
                return reject(new TimeoutError);
            }
            return resolve(collected.last().content);
        });
    });
};

const collectReactions = (message, client, author, ms=60000, multiple=true) => {
    return new Promise((resolve, reject) => {
        const collector = message.createReactionCollector(
            (r, u) => u.id === author.id,
            { time: ms }
        );
        collector.on("collect", r => {
            if ((r.emoji.name === finishReaction && multiple) || !multiple) {
                collector.stop();
                return;
            }
            author.send(getMessageEmbed(client.config, client.translateData.commands.register.reaction_accept))
        });
        collector.on("end", collected => {
            if (!collected.array().length) {
                return reject();
            }
            return resolve(collected.array().map((el) => el.emoji.name));
        });
    });
}

const getCollectedMessage = async (message, config, text, timeoutText, errorText, timeout=60000, description="") => {
    await message.author.send(getMessageEmbed(config, text, description))

    var error = false;
    const response = await collectMessage(message, config, timeout)
        .catch((e) => {
            if (e instanceof CommandUseError) message.author.send(getMessageEmbed(config, errorText, description="", fields=[], error=true));
            else if (e instanceof TimeoutError) message.author.send(getMessageEmbed(config, timeoutText, description="", fields=[], error=true));
            error = true;
        });

    if (error) {
        return new Error();
    }

    return response;
}

const getMessageEmbed = (config, title, description="", fields=[], error=false, footer=false) => {

    var color = config.accentColor;
    if (error) color = config.errorColor;

    const embed = {
        color: color,
        title: title
    }

    if (description.length) {
        embed.description = description;
    }

    if (fields.length) {
        embed.fields = fields;
    }

    if (footer) {
        embed.footer = {
            text: config.year + " © Coddei",
            icon_url: config.logoURL
        }
    }

    return {embed: embed}
}

module.exports = {
    name: "commands.register.name",
    description: "commands.register.description",
    cooldown: 5,
	execute: async (client, message, args) => {

        const content = client.translateData.commands.register;
        const config = client.config;

        if (client.guild.roles.cache.find(role => role.id == config.memberRoleID)) {
            return message.reply(getMessageEmbed(config, content.error_content_1, "", [], false, true));
        }

        // Register message
        await message.author.send(getMessageEmbed(config, content.response_content_1, "", [], false, true));

        const timeoutErrorText = content.error_timeout;
        const commandErrorText = content.error_command_use;
        const data = {}

        data.name = await getCollectedMessage(message, config, content.register_name, timeoutErrorText, commandErrorText, 120000);
        if (data.name instanceof Error) return;
        
        data.nick = await getCollectedMessage(message, config, content.register_nick, timeoutErrorText, commandErrorText);
        if (data.nick instanceof Error) return
        
        data.bio = await getCollectedMessage(message, config, content.register_bio, timeoutErrorText, commandErrorText, 180000, content.register_bio_description);
        if (data.bio instanceof Error) return;
        
        data.portfolio = await getCollectedMessage(message, config, content.register_portfolio, timeoutErrorText, commandErrorText);
        if (data.portfolio instanceof Error) return;

        data.github = await getCollectedMessage(message, config, content.register_github, timeoutErrorText, commandErrorText);
        if (data.github instanceof Error) return;

        var languagesFields = []
        for (language of config.roles.languageRoles) {
            languagesFields.push({
                name: language.name,
                value: language.reaction,
                inline: true
            })
        }
        const languagesDescription = content.register_languages_description
        const languagesMessage = await message.author.send(getMessageEmbed(config, content.register_languages, description=languagesDescription, fields=languagesFields))
        for (language of config.roles.languageRoles) {
            await languagesMessage.react(language.reaction);
        }
        await languagesMessage.react(finishReaction);
        const languageReactionsResponse = await collectReactions(languagesMessage, config, message.author, ms=120000);
        data.languages = config.roles.languageRoles.filter((el) => languageReactionsResponse.includes(el.reaction));

        var levelFields = []
        for (level of config.roles.englishRoles) {
            levelFields.push({
                name: find(level.name, client.translateData),
                value: level.reaction,
                inline: true
            })
        }
        const englishDescription = content.register_english_description
        const englishMessage = await message.author.send(getMessageEmbed(config, content.register_english, description=englishDescription, fields=levelFields))
        for (level of config.roles.englishRoles) {
            await englishMessage.react(level.reaction);
        }        
        const englishReactionsResponse = await collectReactions(englishMessage, config, message.author, ms=120000, multiple=false);
        data.english = config.roles.englishRoles.filter((el) => englishReactionsResponse.includes(el.reaction))[0]

        const profileEmbed = getMessageEmbed(
            config, 
            `${content.profile} » ${data.nick}`, "", 
            [
                {name: content.field_bio, value: data.bio},
                {name: content.field_name, value: data.name, inline: true},
                {name: content.field_nick, value: data.nick, inline: true},
                {name: content.field_portfolio, value: data.portfolio, inline: true},
                {name: content.field_github, value: data.github, inline: true},

                {name: content.field_name, value: data.name, inline: true},
                {name: content.field_name, value: data.name, inline: true},
            ], 
            false, 
            true
        );

        await message.author.send(profileEmbed);
	}
};