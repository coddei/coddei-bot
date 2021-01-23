const { find, getProfileEmbed } = require("../utils");

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

const getUserMessageReactions = (message, authorId) => {
    return message.reactions.cache.filter(reaction => reaction.users.cache.has(authorId));
}

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
            // Tell user if reaction was added correctly
            // author.send(getMessageEmbed(client.config, client.translateData.commands.register.reaction_accept));
        });
        collector.on("end", collected => {
            if (!collected.array().length) {
                return reject();
            }

            var currentReactions = getUserMessageReactions(message, author.id);
            return resolve(currentReactions.map((el) => el.emoji.name));
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

const getMessageEmbed = (
    config,
    title,
    description="",
    fields=[],
    error=false,
    footer=false,
    timestamp=false,
    thumbnail=""
) => {

    var color = config.accentColor;
    if (error) color = config.errorColor;

    const embed = {
        color: color,
        title: title
    }

    if (description.length) embed.description = description;
    if (fields.length) embed.fields = fields;
    if (footer) embed.footer = { text: config.year + " © Coddei", icon_url: config.logoURL };
    if (timestamp) embed.timestamp = new Date();
    if (thumbnail.length) embed.thumbnail = { url: thumbnail };

    return {embed: embed}
}

module.exports = {
    name: "commands.register.name",
    description: "commands.register.description",
    cooldown: 5,
	execute: async (client, message, args) => {

        const content = client.translateData.commands.register;
        const config = client.config;

        const member = client.guild.members.cache.find(member => member.id === message.author.id);

        if (member.roles.cache.find(role => role.id === config.roles.memberRoleID)) {
            return message.reply(getMessageEmbed(config, content.error_content_1, "", [], false, true));
        }

        // Register message
        try {
            await message.author.send(getMessageEmbed(config, content.response_content_1, content.response_content_4, [], false, true));
        } catch (e) {
            return message.reply(content.error_content_2);
        }

        const timeoutErrorText = content.error_timeout;
        const commandErrorText = content.error_command_use;
        var data = {}

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
        const languageReactionsResponse = await collectReactions(languagesMessage, client, message.author, ms=120000);
        data.languages = config.roles.languageRoles.filter(el => languageReactionsResponse.includes(el.reaction));

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
        const englishReactionsResponse = await collectReactions(englishMessage, client, message.author, ms=120000, multiple=false);
        data.english = config.roles.englishRoles.filter(el => englishReactionsResponse.includes(el.reaction))[0]

        const registeringMessage = await message.author.send(getMessageEmbed(config, content.response_content_2));

        const languagesRoles = config.roles.languageRoles
            .filter(role => data.languages.map(el => el.id).includes(role.id))
            .map(role => `<@&${role.id}>`).join(', ');
        const englishRole = config.roles.englishRoles
            .filter(role => role.id === data.english.id)
            .map(role => `<@&${role.id}>`).join(', ');

        var profileEmbed = getMessageEmbed(
            config,
            `${content.profile} » ${data.nick}`, "",
            [
                {name: content.field_bio, value: data.bio},
                {name: content.field_name, value: data.name, inline: true},
                {name: content.field_nick, value: data.nick, inline: true},
                {name: content.field_portfolio, value: data.portfolio, inline: true},
                {name: content.field_github, value: data.github, inline: true},

                {name: content.field_languages, value: languagesRoles, inline: true},
                {name: content.field_english, value: englishRole, inline: true}
            ],
            false,
            true,
            true,
            member.user.displayAvatarURL()
        );

        var registered = false;

        // If has api, send request to add member
        if (config.apiURL.length) {
            try {
                var url = `${config.apiURL}/discord/members`;

                data.user = member.user;
                await client.axios.post(url, data).then((response) => {
                    if (response.data.success) {
                        profileEmbed = getProfileEmbed(client, response.data.user);
                        registered = true;
                    }
                }).catch((e) => {
                    console.log(e);
                });
            } catch (e) {
                console.log(e);
            }
        } else {
            registered = true;
        }

        // If something went wrong
        if (!registered) {
            return message.author.send(getMessageEmbed(config, client.translateData.index.error_something_went_wrong, "", [], false, true));
        }

        // Update user nick
        try {
            await member.setNickname(data.nick);
        } catch (e) {
            console.log(e);
        }

        // Add roles
        for (role of data.languages) {
            await member.roles.add(role.id);
        }
        await member.roles.add(data.english.id);
        await member.roles.add(config.roles.memberRoleID);

        // Send register confirmation
        await registeringMessage.delete();
        await message.author.send(getMessageEmbed(config, content.response_content_3));

        // Send profile embed to new members channel
        const channel = client.guild.channels.cache.find(channel => channel.id == client.config.channels.newcomersChannelID);
        channel.send(profileEmbed);

	}
};