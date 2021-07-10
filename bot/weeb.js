"use strict";

const Bot = require('discord-bot-lib');
const DB = require('./db');
const decancer = require('decancer');
const { avatarFromUser, utc } = require('./util');
const { inspect } = require('util'); 
const { errorColor, color } = require('./constants');
const { join } = require('path');
const { readdirSync } = require('fs');

module.exports = class WeebBot extends Bot {
    constructor() {
        super({
            token: process.env.TOKEN,
            prefix: ">",
            activityName: "most anime watched world record",
            activityType: 5,
            intents: 32767,
            messageCheck: msg => !msg.author.bot,
            websocketProperties: {
                $os: 'Discord iOS',
                $browser: 'Discord iOS',
                $device: 'Discord iOS'
            }
        });
        
        this.db = new DB(process.env.DB_URI);
        this.mainGuild = null;
        this.log = require('./logger');
        this.log('{yellowtext:[WARN]}', 'Logging in to discord...');

        const mutes = {};
        this.addMuteTimeout = (amount, authorID) => {
            mutes[authorID] = setTimeout(async notEnd => {
                if (!notEnd)
                    await this.unmute(authorID);
                clearTimeout(mutes[authorID]);
                delete mutes[authorID];
            }, amount * 1000);
        };

        let readyLevel = 0;
        this.addReadyLevel = async () => {
            if (++readyLevel !== 2) return;
            this.log('{greentext:[SUCCESS]}', 'Bot is fully ready to use.');
            await this.refreshMutes();
        };

        this.removeMuteTimeout = (authorID) => mutes[authorID] ? mutes[authorID]._onTimeout(true) : null;

        // the smart function. made by my broken af brain
        this.refreshMutes = async () => {
            const current = utc();
            let data = await this.db.get();
            data = Array.isArray(data) ? data.filter(x => x.mutedUntil) : (data && data.mutedUntil ? [data] : []);
            if (!data.length) return;
            
            this.log('{yellowtext:[WARN]}', 'Resolving', data.length, 'existing mute(s)...');
            for (const mute of data) {
                await new Promise(resolve => setTimeout(resolve, 500));

                if (current > mute.mutedUntil) {
                    this.log('{redtext:[ERROR]}', 'Outdated mute happening for user with the ID:', mute.authorID, 'unmuting...');
                    await this.unmute(mute.authorID, null, mute);
                } else {
                    this.log('{yellowtext:[WARN]}', 'Continuing ongoing mute for the user ID:', mute.authorID)
                    this.addMuteTimeout(Math.round((mute.mutedUntil - current) / 1000), mute.authorID);
                }
            }
            this.log('{greentext:[SUCCESS]}', 'Successfully stored ongoing mute timeouts.');
        };

        this.clearMuteTimeouts = () => Object.values(mutes).forEach(this.removeMuteTimeout);
    }

    async ban(author, reason) {
        if (!this.mainGuild) return;
        await this.mainGuild.ban(this.api, author, reason);
    }

    async dehoist(author) {
        if (!this.mainGuild) return;
        await this.mainGuild.dehoist(this.api, author);
    }

    async tryDehoist(author) {
        const member = this.mainGuild.members.find(member => author.user.id === member.id);
        if (!member || (member.nick == author.nick && member.name == author.user.username)) return;
        const name = author.nick || author.user.username;
        if (/^[!-']/.test(name))
            await this.dehoist(author.user);
    }

    async tryMentionable(author) {
        const member = this.mainGuild.members.find(member => author.user.id === member.id);
        if (!member || (member.nick == author.nick && member.name == author.user.username)) return;
        const name = (author.nick || author.user.username).toLowerCase();
        const decancered = decancer(name);
        if (decancered === name) return;
        
        const decanceredFiltered = decancered.replace(/\s/g, '');
        if (/nigg(a|er)/.test(decanceredFiltered))
            return await this.ban(author.user, 'Author has a racially offensive username.');

        await this.mainGuild.resolveUnmentionableName(this.api, author.user, decancered);
    }

    async warn(author, reason, moderator) {
        const authorID = author.id;
        const result = await this.db.get({ authorID });
        const warnObject = {
            moderator: moderator ? moderator.id : this.user.id,
            reason,
        };

        if (!moderator)
            moderator = this.user;

        if (!result)
            await this.db.add({
                authorID,
                warns: [ warnObject ]
            });
        else
            await this.db.set({ authorID }, {
                $push: {
                    warns: warnObject
                }
            });

        return await this.mainGuild.log({
            color: errorColor,
            title: `Warn (#${result && result.warns && result.warns.length ? (result.warns.length + 1) : 1})`,
            fields: [
                {
                    name: "User",
                    value: `${author.username}#${author.discriminator} (\`${authorID}\`)`
                },
                {
                    name: "Moderator",
                    value: `${moderator.username}#${moderator.discriminator}`
                },
                {
                    name: "Reason",
                    value: `*${reason}*`
                }
            ],
            thumbnail: {
                url: avatarFromUser(author)
            }
        }, `${moderator.username}#${moderator.discriminator}`, avatarFromUser(moderator));
    }

    async clearwarn(author, moderator) {
        const authorID = author.id;
        const result = await this.db.get({ authorID });
        if (!moderator)
            moderator = this.user;

        if (!result)
            return;
        await this.db.set({ authorID }, {
            $set: {
                warns: []
            }
        });

        await this.mainGuild.log({
            color,
            title: `Warns cleared`,
            fields: [
                {
                    name: "User",
                    value: `${author.username}#${author.discriminator} (\`${authorID}\`)`
                },
                {
                    name: "Moderator",
                    value: `${moderator.username}#${moderator.discriminator}`
                }
            ],
            thumbnail: {
                url: avatarFromUser(author)
            }
        }, `${moderator.username}#${moderator.discriminator}`, avatarFromUser(moderator));
    }

    async mute(user, time, moderator) {
        const authorID = user.id;
        const mutedUntil = utc() + (time * 1000);
        const success = await this.mainGuild.mute(this.api, authorID);
        if (!success) return this.log('{redtext:[ERROR]}', 'Cannot mute', authorID, 'cancelling.');
        if (!moderator)
            moderator = this.user;

        const result = await this.db.get({ authorID });
        if (!result)
            await this.db.add({ authorID, mutedUntil });
        else
            await this.db.set({ authorID }, {
                $set: { mutedUntil }
            });
        
        this.addMuteTimeout(time, authorID);
        await this.mainGuild.log({
            color: errorColor,
            title: "Mute",
            fields: [
                {
                    name: "User",
                    value: `${user.username}#${user.discriminator} (\`${authorID}\`)`
                },
                {
                    name: "Moderator",
                    value: `${moderator.username}#${moderator.discriminator}`
                },
                {
                    name: "Muted until",
                    value: new Date(mutedUntil).toUTCString()
                }
            ],
            thumbnail: {
                url: avatarFromUser(user)
            }
        }, `${moderator.username}#${moderator.discriminator}`, avatarFromUser(moderator));
    }

    async unmute(user, moderator, existingDBResponse) {
        const success = await this.mainGuild.unmute(this.api, user.id || user);
        if (!success) return this.log('{redtext:[ERROR]}', 'Cannot unmute', user.id || user, 'cancelling.');
        else if (!user.id)
            user = await this.api('GET', `/users/${user}`);

        const authorID = user.id;
        if (!moderator)
            moderator = this.user;
        this.removeMuteTimeout(authorID);
        const result = existingDBResponse || await this.db.get({ authorID }); // to save db calls
        
        if (!result)
            return;
        await this.db.set({ authorID }, {
            $unset: {
                mutedUntil: 1
            }
        });
        
        await this.mainGuild.log({
            color,
            title: "Unmute",
            fields: [
                {
                    name: "User",
                    value: `${user.username}#${user.discriminator} (\`${authorID}\`)`
                },
                {
                    name: "Moderator",
                    value: `${moderator.username}#${moderator.discriminator}`
                }
            ],
            thumbnail: {
                url: avatarFromUser(user)
            }
        }, `${moderator.username}#${moderator.discriminator}`, avatarFromUser(moderator));
    }
    
    collectAnimes() {
        this.log('{yellowtext:[WARN]}', 'Loading command and event files...');
        for (const animeName of readdirSync(join(__dirname, '..', 'anime-list')))
            this.command({
                name: animeName.slice(0, -3),
                ...require(join(__dirname, '..', 'anime-list', animeName))
            });
        
        for (const animeEvent of readdirSync(join(__dirname, '..', 'anime-events'))) {
            const callback = require(join(__dirname, '..', 'anime-events', animeEvent))
            this.addEventListener(animeEvent.slice(0, -3), data => callback(this, data));
        }
        
        this.log('{greentext:[SUCCESS]}', 'Successfully loaded command and event(s).');

        return this
            .addEventListener('close', () => {
                this.log('{redtext:[ERROR]}', 'Bot closed.');
                this.clearMuteTimeouts();
                this.db.close();
            })
            .addEventListener('cooldown', async (ctx, retryAfter) => {
                await ctx.send({
                    embed: {
                        title: `Woah there! calm down! try again at ${retryAfter} second${retryAfter === 1 ? '' : 's'}.`,
                        color: errorColor
                    }
                });
            })
            .addEventListener('error', async (ctx, err) => {
                this.log(`{redtext:[ERROR]}`, `An error occurred while running ${ctx.command.name}.`);
                await ctx.send(`An error occurred while running \`${ctx.command.name}\`.\n\`\`\`js\n${inspect(err).slice(0, 1000)}\`\`\``);
            });
    }
    
    transformToAWeeb() {
        this
            .collectAnimes()
            .run();
    }
}