"use strict";

const server = require('express')();
const log = require('./bot/logger');
const WeebBot = require('./bot/weeb');
const luca = new WeebBot();

server.get('/', (req, res) => res.send('ok'));

log('{yellowtext:[WARN]}', 'Starting server...');

server.listen(log('{greentext:[SUCCESS]}', 'Successfully connected to server.'));

luca.transformToAWeeb();