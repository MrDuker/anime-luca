"use strict";

const { mimicWebhook, errorColor } = require('../bot/constants');
const { avatarFromUser, request } = require('../bot/util');

module.exports = {
    cooldown: 7000,
    noArgs: async (ctx) => {
        await ctx.send({
            embed: {
                title: "Please add a message (and a user/mention beforehand, if you want to)",
                description: "Example: `>mimic <@661200758510977084> i suck`",
                color: errorColor
            }
        });
    },
    run: async (ctx) => {
        // best code ever made
        const user = ctx.message.mentions && ctx.message.mentions.length ? ctx.message.mentions[0] : ctx.message.author;
        const message = ctx.args.join(' ').replace(`<@${user.id}>`, '').replace(`<@!${user.id}>`, '');
        if (!message.length)
            return await module.exports.noArgs(ctx);
        
        const name = ctx.bot.mainGuild.members.find(x => x.id === user.id).nick || user.username;

        await request({
            host: 'discord.com',
            path: mimicWebhook,
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            }
        }, {
            allowed_mentions: {
                parse: []
            },
            content: message,
            avatar_url: avatarFromUser(user),
            username: name
        });
    }
}