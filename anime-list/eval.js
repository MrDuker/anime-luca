"use strict";

const { errorColor, owners } = require('../bot/constants');
const { typing } = require('../bot/util');
const { inspect } = require('util');
const tio = require('tio.js');
tio.setDefaultTimeout(5000);

module.exports = {
    aliases: ["exec"],
    cooldown: 4000,
    noArgs: async (ctx) => {
        await ctx.send({
            embed: {
                color: errorColor,
                title: "Please add a code to evaluate, master."
            }
        });
    },
    run: async (ctx) => {
        await typing(ctx);
        let code = ctx.args.join(' ');
        if (/^```(.*?)```$/.test(code))
            code = code.slice(3, -3);
        else if (/^`(.*?)`$/.test(code))
            code = code.slice(1, -1);
        
        if (code.startsWith('js\n'))
            code = code.slice(3);
        
        if (!code.length)
            return await module.exports.noArgs(ctx);
        
        let output;
        try {
            if (owners.includes(ctx.message.author.id))
                output = inspect(eval(code));
            else
                output = (await tio(code)).output;
            
            if (output instanceof Promise) output = await output;
        } catch (err) {
            output = inspect(err);
        }
        await ctx.send(`\`\`\`js\n${output.slice(0, 1000)}\`\`\``);
    }
};