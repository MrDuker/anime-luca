"use strict";

const fetch = require('https').request;
module.exports = {
    typing: async (ctx) => {
        await ctx.bot.api('POST', `/channels/${ctx.message.channel_id}/typing`);
    },
    parseTwoArguments: (content) => {
        const delimiter = ['|', ', ', ',', '-', ' '].find(c => content.includes(c));

        if (delimiter) {
            content = content.split(delimiter);
            return [content[0], content.slice(1).join(delimiter)];
        }
        return [content];
    },
    avatarFromUser(user) {
        if (!user.avatar)
            return `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`;
        return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=512`;
    },
    request: (requestObject, requestBody) => {
        return new Promise(resolve => {
            const req = fetch(requestObject, resp => {
                let str = '';
                resp.on('data', d => str += d);
                resp.once('end', () => resolve(str));
            });
            
            req.setTimeout(2500, () => {
                if (!req.destroyed) req.destroy();
                resolve(null);
            });
            req.end(requestBody ? JSON.stringify(requestBody) : null);
        });
    },
    react: async (ctx, emoji) => {
        await ctx.bot.api('PUT', `/channels/${ctx.message.channel_id}/messages/${ctx.message.id}/reactions/${encodeURIComponent(emoji)}/@me`);
    },
    utc: (data) => {
        if (!data) data = new Date();
        else if (!(data instanceof Date)) data = new Date(data);

        return data.getTime() + data.getTimezoneOffset() * 60;
    }
};