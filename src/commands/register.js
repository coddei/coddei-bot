
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

const levels = [
    ["commands.register.register_english_beginner", "1⃣"],
    ["commands.register.register_english_intermediate", "2⃣"],
    ["commands.register.register_english_advanced", "3⃣"],
    ["commands.register.register_english_fluent", "4⃣"]
]

const languageReactions = [
    ["Python", "1⃣"],
    ["Javascript", "2⃣"],
    ["Typescript", "3⃣"],
    ["Java", "4⃣"],
    ["Kotlin", "5⃣"],
    ["Swift", "6⃣"],
    ["PHP", "7⃣"],
    ["C#", "8⃣"],
    ["C & C++", "9⃣"],
    ["Lua", "🔟"],
    ["SQL", "🇦"],
    ["NoSQL", "🇧"],
    ["UI & UX", "🇨"]
];

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

const collectReactions = (message, config, author, ms=60000, multiple=true) => {
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
            author.send(getMessageEmbed(config, "Aceito"))
        });
        collector.on("end", collected => {
            if (!collected.array().length) {
                return reject();
            }
            return resolve(collected.array().map((el) => el.emoji.name));
        });
    });
}

const getMessageEmbed = (config, title, description="", fields=[], error=false) => {

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

    return {embed: embed}
}

module.exports = {
    name: "commands.register.name",
    description: "commands.register.description",
    cooldown: 5,
	execute: async (client, message, args) => {

        const content = client.translateData.commands.register;

        if (client.guild.roles.cache.find(role => role.id == client.config.memberRoleID)) {

            const registeredEmbed = new MessageEmbed()
                .setColor(client.config.accentColor)
                .setTitle(content.error_content_1)
                .setFooter(client.config.year + " © Coddei", client.config.logoURL);

            return message.reply(registeredEmbed);
        }

        const registerEmbed = new MessageEmbed()
            .setColor(client.config.accentColor)
            .setTitle(content.response_content_1)
            .setFooter(client.config.year + " © Coddei", client.config.logoURL);

        const data = {}

        await message.author.send(registerEmbed);

        var cancelRegister = false;

        await message.author.send(getMessageEmbed(client.config, content.register_name))
        const nameResponse = await collectMessage(message, client.config, 5000)
            .catch((e) => {
                if (e instanceof CommandUseError) message.author.send(getMessageEmbed(client.config, content.error, description=content.error_command_use, fields=[], error=true));
                else if (e instanceof TimeoutError) message.author.send(getMessageEmbed(client.config, content.error, description=content.error_timeout, fields=[], error=true));
                cancelRegister = true;
            });

        if (cancelRegister) return;

        await message.author.send(getMessageEmbed(client.config, content.register_portfolio))
        const portfolioResponse = await collectMessage(message, client.config)
            .catch((e) => {
                message.author.send(getMessageEmbed(client.config, content.error, description=content.error_timeout, fields=[], error=true));
                cancelRegister = true;
            });

        if (cancelRegister) return;

        await message.author.send(getMessageEmbed(client.config, content.register_github))
        const githubResponse = await collectMessage(message, client.config)
            .catch((e) => {
                message.author.send(getMessageEmbed(client.config, content.error, description=content.error_timeout, fields=[], error=true));
                cancelRegister = true;
            });

        if (cancelRegister) return;

        var languagesFields = []
        for (reaction of languageReactions) {
            languagesFields.push({
                name: reaction[0],
                value: reaction[1],
                inline: true
            })
        }
        const languagesDescription = content.register_languages_description
        const languagesMessage = await message.author.send(getMessageEmbed(client.config, content.register_languages, description=languagesDescription, fields=languagesFields))
        for (reaction of languageReactions) {
            await languagesMessage.react(reaction[1]);
        }
        await languagesMessage.react(finishReaction);
        const languageReactionsResponse = await collectReactions(languagesMessage, client.config, message.author, ms=120000)
            .catch((e) => {
                message.author.send(getMessageEmbed(client.config, content.error, description=content.error_timeout, fields=[], error=true));
                cancelRegister = true;
            });

        if (cancelRegister) return;

        const languages = languageReactions.filter((el) => languageReactionsResponse.includes(el[1])).map((el) => el[0]);

        var levelFields = []
        for (level of levels) {
            levelFields.push({
                name: find(level[0], client.translateData),
                value: level[1],
                inline: true
            })
        }
        const englishDescription = content.register_english_description
        const englishMessage = await message.author.send(getMessageEmbed(client.config, content.register_english, description=englishDescription, fields=levelFields))
        for (level of levels) {
            await englishMessage.react(level[1]);
        }        
        const englishReactionsResponse = await collectReactions(englishMessage, client.config, message.author, ms=120000, multiple=false)
            .catch((e) => {
                message.author.send(getMessageEmbed(client.config, content.error, description=content.error_timeout, fields=[], error=true));
                cancelRegister = true;
            });

        if (cancelRegister) return;

        const lvl = find(levels.filter((el) => englishReactionsResponse.includes(el[1])).map((el) => el[0])[0], client.translateData)

        var desc = `Seus dados são: \nNome: ${nameResponse}\nPortfólio: ${portfolioResponse}\nGithub: ${githubResponse}\nLinguagens: ${languages.join(",")}\nInglês: ${lvl}}`
        await message.author.send(getMessageEmbed(client.config, "Resultado", description=desc))


	}
};