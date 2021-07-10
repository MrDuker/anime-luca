"use strict";

module.exports = (bot, data) => {
    if (!bot.mainGuild || bot.mainGuild.id !== data.id) return;
    bot.mainGuild.updateGuild(data);
}