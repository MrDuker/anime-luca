const { color } = require('../bot/constants');

module.exports = {
    aliases: ["pong"],
    cooldown: 2000,
    run: (ctx) => ctx.send({
        embed: {
            title: `pong! ${ctx.bot.ping} ms`,
            color,
        }
    })
};