"use strict";
const { autoroleID, color } = require('../bot/constants');
const { avatarFromUser } = require('../bot/util');
const decancer = require('decancer');

module.exports = async (bot, data) => {
    if (!bot.mainGuild || bot.mainGuild.id !== data.guild_id) return;
    bot.mainGuild.addMember(data);

    const name = decancer(data.user.username);
    const nameFiltered = name.replace(/\s/g, '');
    if (/nigg(a|er)/.test(nameFiltered))
        return await bot.ban(data.user, 'Author has a racially offensive username.');
    else if (/^[!-']/.test(name))
        await bot.dehoist(data.user);
    else if (name !== data.user.username)
        await bot.mainGuild.resolveUnmentionableName(bot.api, data.user, name);
    
    if (process.uptime() < 30)
        return;

    if (!data.user.bot)
        await bot.api('PUT', `/guilds/${data.guild_id}/members/${data.user.id}/roles/${autoroleID}`);
    
    await bot.mainGuild.log({
        title: `${name}#${data.user.discriminator} joined server.py!`,
        description: "Welcome to the club :sunglasses:",
        timestamp: new Date().toISOString(),
        color,
    }, name, avatarFromUser(data.user));
};