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
    }
}