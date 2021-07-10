const { typing, avatarFromUser } = require("../bot/util");
const { color, errorColor } = require('../bot/constants');

module.exports = {
    cooldown: 10000,
    aliases: ["warns"],
    run: async (ctx) => {
        await typing(ctx);
        const user = ctx.message.mentions && ctx.message.mentions.length ? ctx.message.mentions[0] : ctx.message.author;
        const response = await ctx.bot.db.get({ authorID: user.id });
        
        if (!response || ((!response.warns || !response.warns.length) && !response.mutedUntil))
            return await ctx.send({
                embed: {
                    title: "No data found.",
                    description: `This means that <@${user.id}> is free from infractions or mutes! <3`,
                    color,
                    footer: "...for now.",
                    thumbnail: avatarFromUser(user)
                }
            });
        
        await ctx.send({
            embed: {
                color: errorColor,
                title: `${user.username}#${user.discriminator}`,
                thumbnail: avatarFromUser(user),
                fields: Object.fromEntries([
                    [`Infractions [${response.warns ? response.warns.length : 0}]`, (response.warns && response.warns.length ? response.warns.map(x => `- Warned by <@${x.moderator}> for *${x.reason}*`) : [ "No warns found." ]).join("\n")],
                    [`Mutes`, response.mutedUntil ? `*Muted until ${new Date(response.mutedUntil).toUTCString()}*` : '*Not muted*']
                ])
            }
        });
    }
};