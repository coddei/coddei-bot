
const { MessageEmbed } = require("discord.js");

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
                return reject();
            }
            collector.stop();
        });
        collector.on("end", collected => {
            if (!collected.array().length) {
                return reject();
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
            author.send(getEmbed(config, "Aceito"))
        });
        collector.on("end", collected => {
            if (!collected.array().length) {
                return reject();
            }
            return resolve(collected.array().map((el) => el.emoji.name));
        });
    });
}

const getMessageEmbed = (config, title, description="", fields=[]) => {

    const embed = {
        color: config.accentColor,
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

        await message.author.send(getMessageEmbed(client.config, content.register_name))
        const nameResponse = await collectMessage(message, client.config, 120000);

        await message.author.send(getMessageEmbed(client.config, content.register_portfolio))
        const portfolioResponse = await collectMessage(message, client.config);

        await message.author.send(getMessageEmbed(client.config, content.register_github))
        const githubResponse = await collectMessage(message, client.config);

        var languagesFields = []
        for (reaction of languageReactions) {
            languagesFields.push({
                name: reaction[0],
                value: reaction[1],
                inline: true
            })
        }
        const languagesDescription = content.register_languages_description
        const languagesMessage = await message.author.send(getMessageEmbed(client.config, "Linguagens", description=languagesDescription, fields=languagesFields))
        for (reaction of languageReactions) {
            await languagesMessage.react(reaction[1]);
        }
        await languagesMessage.react(finishReaction);

        const languageReactionsResponse = await collectReactions(message, client.config, message.author, ms=120000);

	}
};