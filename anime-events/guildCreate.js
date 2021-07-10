"use strict";

const { mainServerID } = require('../bot/constants');
const MainGuild = require('../bot/mainGuild');

module.exports = async (bot, guild) => {
    if (guild.id !== mainServerID) return;
    bot.log('{greentext:[SUCCESS]}', 'Created mainGuild object.');
    bot.mainGuild = new MainGuild(guild);
    await bot.addReadyLevel();
}