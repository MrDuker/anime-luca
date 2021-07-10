"use strict";
const { avatarFromUser } = require('./util');
const { modlogWebhook, errorColor, muteRoleID, moderatorRoleIDs } = require('./constants');
const { request } = require('https');
const isModerator = (rolesList) => !!rolesList.find(role => moderatorRoleIDs.includes(role));

module.exports = class MainServer {
    constructor(data) {
        this.members = [];
        for (const member of data.members)
            this.addMember(member);
    
        this.updateGuild(data);
    }

    async mute(request, authorID) {
        const res = this.members.find(member => member.id === authorID);
        const memberRoles = res ? res.roles : [ muteRoleID ];
        if (isModerator(memberRoles) || memberRoles.includes(muteRoleID)) return false;
        await request('PUT', `/guilds/${this.id}/members/${authorID}/roles/${muteRoleID}`);
        return true;
    }

    async unmute(request, authorID) {
        const res = this.members.find(member => member.id === authorID);
        const memberRoles = res ? res.roles : [];
        if (isModerator(memberRoles) || !memberRoles.includes(muteRoleID)) return false;
        await request('DELETE', `/guilds/${this.id}/members/${authorID}/roles/${muteRoleID}`);
        return true;
    }

    getMemberFromString(str) {
        if (!str) return;

        str = str.toLowerCase().trim();
        const mentionMatch = str.match(/<(@!?)(\d+)>/);
        if (mentionMatch && mentionMatch[2])
            str = mentionMatch[2];

        for (const member of this.members)
            if (member.id == str || (member.nick || member.name).toLowerCase().includes(str))
                return member;
    }

    updateGuild(guild) {
        this.icon = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith('a_') ? 'gif' : 'png'}?size=512`;
        this.id = guild.id;
    }

    addMember(member) {
        this.members.push({
            name: member.user.username,
            discriminator: member.user.discriminator,
            nick: member.nick,
            id: member.user.id,
            joinedAt: member.joined_at,
            avatar: member.user.avatar
        });
    }

    updateMember(member) {
        // a little bit overkill but at least it's "fast"
        for (let i = 0; i < this.members.length; i++)
            if (this.members[i].id === member.user.id) {
                this.members[i] = {
                    name: member.user.username,
                    discriminator: member.user.discriminator,
                    nick: member.nick,
                    id: member.user.id,
                    joinedAt: member.joined_at,
                    avatar: member.user.avatar
                };
                return;
            }
        
        this.addMember(member);
    }

    removeMember(member) {
        this.members = this.members.filter(m => m.id !== member.user.id);
    }

    log(embed, username, avatar_url) {
        return new Promise(resolve => {
            request({
                method: 'POST',
                host: 'discord.com',
                path: modlogWebhook,
                headers: {
                    'content-type': 'application/json'
                },
                userAgent: null
            }, resp => resp.once('close', () => resolve())).end(JSON.stringify({
                embeds: [embed],
                username,
                avatar_url,
            }));
        });
    }

    async ban(request, author, reason) {
        await request('PUT', `/guilds/${this.id}/bans/${author.id}`, {
            reason: reason || 'Reason not provided.',
            delete_message_days: 7
        });

        const url = avatarFromUser(author);
        await this.log({
            title: `Ban`,
            thumbnail: { url },
            fields: [
                {
                    name: 'Reason',
                    value: `*${reason}*`
                },
                {
                    name: 'User',
                    value: `${author.username}#${author.discriminator} (\`${author.id}\`)`
                }
            ],
            color: errorColor
        }, author.username, url);
    }

    async resolveUnmentionableName(request, author, decancered) {
        await request('PATCH', `/guilds/${this.id}/members/${author.id}`, {
            nick: decancered
        });

        const url = avatarFromUser(author);
        await this.log({
            title: 'Unmentionable name fixed',
            thumbnail: { url },
            fields: [
                {
                    name: 'User',
                    value: `<@${author.id}> (\`${author.id}\`)`
                }
            ],
            color: errorColor
        }, decancered, url);
    }

    async dehoist(request, author) {
        await request('PATCH', `/guilds/${this.id}/members/${author.id}`, {
            nick: "Dehoisted name"
        });

        const url = avatarFromUser(author);
        await this.log({
            title: `Dehoisted`,
            thumbnail: { url },
            fields: [
                {
                    name: 'User',
                    value: `${author.username}#${author.discriminator} (\`${author.id}\`)`
                }
            ],
            color: errorColor,
        }, author.username, url);
    }
}