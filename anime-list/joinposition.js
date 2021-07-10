const { color } = require('../bot/constants');
const { typing, avatarFromUser } = require('../bot/util');

function joinPosition(ctx, data) {
    const map = new Map();
    for (const member of ctx.bot.mainGuild.members)
        map.set(new Date(member.joinedAt).getTime(), member.id);

    const resultMap = new Map();
    for (const sortMember of [...map.keys()].sort())
        resultMap.set(sortMember, map.get(sortMember));
    
    map.clear(); // to free memory, if that's how memory works
    const entries = [...resultMap.entries()];
    
    let str = "";
    let valueIndex, user;

    if (typeof data === 'string') {
        // user ID
        user = ctx.bot.mainGuild.members.find(x => x.id === data);
        valueIndex = entries.map(x => x[1]).indexOf(data);
    } else {
        // a number
        valueIndex = data;
    }

    let start = valueIndex - 5;
    if (start < 0) start = 0;

    let end = valueIndex + 5;
    if (end > entries.length) end = entries.length - 1;

    for (let i = start; i <= end; i++) {
        str += `${i + 1}. <@${entries[i][1]}> - ${new Date(entries[i][0]).toUTCString()}${i === valueIndex ? ' **<<<**' : ''}\n`;
        if (i === valueIndex && !user)
            user = ctx.bot.mainGuild.members.find(x => x.id === entries[i][1]);
    }

    resultMap.clear();
    return [str.trim(), user, valueIndex];
}

module.exports = {
    cooldown: 5000,
    aliases: ['jp'],
    run: async (ctx) => {
        await typing(ctx);
        const membersLength = ctx.bot.mainGuild.members.length;
        const id = ctx.message.mentions && ctx.message.mentions.length ? ctx.message.mentions[0].id : ctx.message.author.id;
        const [str, user, valueIndex] = joinPosition(ctx, id);
        
        const buttonsObject = [];
        if (valueIndex !== 1)
            buttonsObject.push({
                text: "First join position",
                check: u => u.id === ctx.message.author.id,
                callback: async (interaction) => {
                    const [string, member, index] = joinPosition(interaction, 0);
                    await interaction.send({
                        embed: {
                            title: `Join position for ${member.name}#${member.discriminator} (#${index + 1})`,
                            description: string,
                            color,
                            footer: `...out of ${membersLength} members.`,
                            thumbnail: avatarFromUser(member)
                        }
                    });
                }
            });
        
        if (valueIndex !== membersLength)
            buttonsObject.push({
                text: "Recent join position",
                check: u => u.id === ctx.message.author.id,
                callback: async (interaction) => {
                    const [string, member, index] = joinPosition(interaction, membersLength - 1);
                    await interaction.send({
                        embed: {
                            title: `Join position for ${member.name}#${member.discriminator} (#${index + 1})`,
                            description: string,
                            color,
                            footer: `...out of ${membersLength} members.`,
                            thumbnail: avatarFromUser(member)
                        }
                    });
                }
            });

        return await ctx.send({
            embed: {
                title: `Join position for ${user.name}#${user.discriminator} (#${valueIndex + 1})`,
                description: str,
                color,
                footer: `...out of ${membersLength} members.`,
                thumbnail: avatarFromUser(user)
            },
            buttons: buttonsObject
        });
    }
};