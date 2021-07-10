"use strict";

module.exports = async (bot, data) => {
    if (!bot.mainGuild || bot.mainGuild.id !== data.guild_id) return;
    await bot.tryDehoist(data);
    await bot.tryMentionable(data);
    bot.mainGuild.updateMember(data);
};