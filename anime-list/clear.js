const { typing, utc } = require('../bot/util');
const { moderatorRoleIDs, color, errorColor } = require('../bot/constants');

module.exports = {
    cooldown: 30000,
    aliases: ['purge'],
    run: async (ctx) => {
        await typing(ctx);

        const { member, mentions, channel_id, timestamp, author } = ctx.message;
        const { request } = ctx.bot.http;
        if (!member.roles.find(role => moderatorRoleIDs.includes(role))) return await ctx.send("You are not a moderator. I'll clear you from this server instead.");
        let limit = ctx.args.find(x => !isNaN(x) && x > 4 && x < 101) || null;

        const mention = mentions && mentions.length ? mentions[0].id : null;
        if (mention) limit = 100;
        else if (limit === null) return await ctx.send({
            embed: {
                title: "Please add a mention or a number between 5 and 100.",
                color: errorColor,
                footer: "...you are dum"
            }
        });

        let messages = await request('GET', `/channels/${channel_id}/messages?limit=${limit}`);
        if (mention)
            messages = messages.filter(x => x.author.id === mention);
        
        const current = utc();
        messages = messages.filter(x => ((current - new Date(timestamp)) / 1000) < 1209600).map(x => x.id);

        await request('POST', `/channels/${channel_id}/messages/bulk-delete`, { messages });
        await request('POST', `/channels/${channel_id}/messages`, {
            embed: {
                title: `Successfully cleared ${messages.length} message${messages.length === 1 ? '' : 's'}.`,
                color,
                footer: {
                    text: `If someone is mad because the messages are gone, blame ${author.username}#${author.discriminator}.`
                }
            }
        });
    }
}