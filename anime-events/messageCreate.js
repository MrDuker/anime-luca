"use strict";

const { advertisingChannelIDs, errorColor, autoMessageRoles } = require('../bot/constants');
const { avatarFromUser } = require('../bot/util');
const decancer = require('decancer');

module.exports = async (bot, msg) => {
    if (msg.author.bot || !msg.guild_id) return;
    const cleanedContent = decancer(msg.content || " ").replace(/\s/g, '');

    if (cleanedContent.includes('nigga') || cleanedContent.includes('nigger'))
        return await bot.ban(msg.author, 'Sending n-word in chat.');
    else if ((/discord\.gg\/(\w+)/.test(cleanedContent) || /discord\.com\/invite\/(\w+)/.test(cleanedContent)) && !advertisingChannelIDs.includes(msg.channel_id)) {
        await bot.http.request('DELETE', `/channels/${msg.channel_id}/messages/${msg.id}`);
        await bot.http.request('POST', `/channels/${msg.channel_id}/messages`, {
            embed: {
                title: "Uh oh!",
                description: "You posted an advertisement in the wrong channel. Please use the correct advertising channel instead.",
                footer: {
                    text: "Your warn count increased by 1."
                },
                color: errorColor,
                thumbnail: {
                    url: avatarFromUser(msg.author)
                }
            }
        });
        return await bot.warn(msg.author, "Posting ads in non-advertising channels.");
    }

    if (Object.keys(autoMessageRoles).includes(msg.channel_id) && !bot.mainGuild.members.find(x => x.id === msg.author.id).roles.includes(autoMessageRoles[msg.channel_id]))
        return await bot.http.request('PUT', `/guilds/${msg.guild_id}/members/${msg.author.id}/roles/${autoMessageRoles[msg.channel_id]}`);
};