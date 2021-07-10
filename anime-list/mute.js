const { react } = require('../bot/util');
const { moderatorRoleIDs } = require('../bot/constants');

function parseTime(string) {
    try {
        const res = string.match(/(\d+)(\w)/);
        const number = Number(res[1]);
        let multiplication = 1;

        switch (res[2].toLowerCase()) {
            case 'w':
                multiplication = 604800;
                break;
            case 'd':
                multiplication = 86400;
                break;
            case 'h':
                multiplication = 3600;
                break;
            case 'm':
                multiplication = 60;
        }

        return number * multiplication;
    } catch {
        return;
    }
}

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

        const amount = parseTime(ctx.args.join(' ').replace(`<@${user.id}>`, '').replace(`<@!${user.id}>`, ''));
        if (!amount) return await module.exports.noArgs(ctx);

        await react(ctx, "✅");
        await ctx.bot.mute(user, amount, ctx.message.author);
    }
};