"use strict";

const { color } = require('../bot/constants');

module.exports = {
    aliases: ["commands", "yardım", "about"],
    cooldown: 1000,
    run: async (ctx) => {
        await ctx.send({
            embed: {
                title: "hello",
                description: "i am anime luca, i am the bot that primarily moderates this hideous server. i watch anime all the time.",
                color,
                fields: {
                    commands: ctx.bot.cmds.map(x => `\`${x.name}\``).join(', ')
                },
                thumbnail: ctx.avatar({ size: 512 }),
                footer: "Thanks for taking the time and reading this very message embed."
            }
        });
    }
};