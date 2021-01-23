const { MessageEmbed } = require("discord.js");
const { language } = require("../config.json")

module.exports = {
    getYear() {
        today = new Date();
        return today.getFullYear();
    },
    getTranslateData() {
        const data = require(`../assets/translation/${language}.json`);
        return data;
    },
    find(keypath, target) {
        return keypath.split('.').reduce((previous, current) => previous[current], target);
    },
    getProfileEmbed(client, userData) {
        const content = client.translateData.commands.register;
        const config = client.config;

        const knownLanguageRoles = config.roles.languageRoles.map(el => el.id);
        var languageRoles = userData.discord.roles
            .filter(el => knownLanguageRoles.includes(el.role_id))
            .map(el => `<@&${el.role_id}>`).join(', ');

        const knownEnglishRoles = config.roles.englishRoles.map(el => el.id);
        const englishRole = userData.discord.roles
            .filter(el => knownEnglishRoles.includes(el.role_id))
            .map(el => `<@&${el.role_id}>`)[0];

        const githubURL = userData.github_url || content.none;
        const portfolioURL = userData.portfolio_url || content.none;

        // Check if user has any languages selected
        if (!languageRoles.length) {
            languageRoles = content.nothing;
        }

        return new MessageEmbed()
            .setColor(config.accentColor)
            .setTitle(`${content.profile} » ${userData.nickname}`)
            .addFields(
                { name: content.field_bio, value: userData.description },
                { name: content.field_name, value: userData.name, inline: true },
                { name: content.field_nick, value: userData.nickname, inline: true },
                { name: content.field_portfolio, value: portfolioURL, inline: true },
                { name: content.field_github, value: githubURL, inline: true },
                { name: content.field_languages, value: languageRoles, inline: true },
                { name: content.field_english, value: englishRole, inline: true }
            )
            .setThumbnail(userData.discord.displayAvatarURL)
            .setTimestamp()
            .setFooter(config.year + " © Coddei", config.logoURL);
    },
    getRecommendationEmbed(client, recommendationData) {
        const content = client.translateData.commands.recommend;
        const config = client.config;

        return new MessageEmbed()
            .setColor(client.config.accentColor)
            .setTitle(`${content.response_content_3} » ${recommendationData.author.username}`)
            .addFields(
                {name: content.response_content_4, value: recommendationData.title},
                {name: content.response_content_5, value: recommendationData.url},
                {name: content.response_content_6, value: recommendationData.description}
            )
            .setTimestamp()
            .setFooter(config.year + " © Coddei", config.logoURL);
    }
}