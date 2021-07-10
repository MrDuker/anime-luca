const { react } = require('../bot/util');
const { moderatorRoleIDs } = require('../bot/constants');

module.exports = {
    cooldown: 15000,
    noArgs: async (ctx) => {
        await react(ctx, '❌');
    },
    onCooldown: async (ctx) => {
        return await module.exports.noArgs(ctx);
    },
    run: async (ctx) => {
        if (!ctx.message.member.roles.find(x => moderatorRoleIDs.includes(x)) || !ctx.message.mentions || !ctx.message.mentions.length) return await module.exports.noArgs(ctx);
        const user = ctx.message.mentions[0];
        if (user.id === ctx.message.author.id) return await module.exports.noArgs(ctx);

        await react(ctx, "✅");
        await ctx.bot.unmute(user, ctx.message.author);
    }
};