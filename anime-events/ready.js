"use strict";

module.exports = async (bot, data) => {
    if (!bot.user) bot.user = data.user;
    bot.log('{greentext:[SUCCESS]}', 'Connected to discord. Connecting to database...');
    
    await bot.db.connect();
    bot.db.selectCollection('main', 'privateserver');
    bot.log('{greentext:[SUCCESS]}', 'Connected to database.');
    await bot.addReadyLevel();
};