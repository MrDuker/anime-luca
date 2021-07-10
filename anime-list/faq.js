"use strict";

const { faq, color, errorColor } = require('../bot/constants');
const maxStringLength = faq.length.toString().length;

module.exports = {
    aliases: ["fuck"],
    cooldown: 2000,
    run: async (ctx) => {
        let clickedAmount = 0;

        await ctx.send({
            embed: {
                title: "Frequently Asked Questions",
                color,
                footer: "Select the dropdowns, you can only select at most 5 dropdowns from this message :3"
            },
            select: {
                placeholder: "Select question...",
                options: faq.map((x, i) => {
                    return {
                        text: `FAQ #${i + 1}`,
                        description: x[0],
                        emoji: "❓"
                    };
                }),
                check: u => u.id === ctx.message.author.id,
                callback: async (context, values, stop) => {
                    await context.send({
                        embed: {
                            title: faq[values[0]][0],
                            description: faq[values[0]][1],
                            color,
                        },
                        ephemeral: true
                    });
                    
                    if (++clickedAmount > 4)
                        stop();
                }
            }
        });
    }
}