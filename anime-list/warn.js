const { react } = require('../bot/util');
const { moderatorRoleIDs } = require('../bot/constants');

module.exports = {
    cooldown: 10000,
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

        const reason = ctx.args.join(' ').replace(`<@${user.id}>`, '').replace(`<@!${user.id}>`, '').trim() || "Reason not provided.";

        await react(ctx, "✅");
        await ctx.bot.warn(user, reason, ctx.message.author);
    }
};