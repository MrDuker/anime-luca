"use strict";
const { errorColor } = require('../bot/constants');
const { avatarFromUser } = require('../bot/util');

module.exports = async (bot, data) => {
    if (!bot.mainGuild || bot.mainGuild.id !== data.guild_id) return;
    bot.mainGuild.removeMember(data);
    await bot.mainGuild.log({
        title: `${data.user.username}#${data.user.discriminator} left server.py :c`,
        description: `\"This server is bad >:c\"\n\n- ${data.user.username}#${data.user.discriminator}`,
        timestamp: new Date().toISOString(),
        color: errorColor
    }, data.user.username, avatarFromUser(data.user));
};