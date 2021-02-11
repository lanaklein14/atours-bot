const Discord = require('discord.js');

module.exports = class AToursBot {
    constructor(loggerId) {
        // regular expression of the message to be forwarded
        this.REGEX_MESSAGE = /(連戦|ツアー|train|tour)/i;
        this.client = new Discord.Client();
        this.loggerId = loggerId;
        this.rules = {};
        this.forwardedMessageMap = [];
    }

    addRule(senderId, receivers) {
        this.rules[senderId] = receivers;
    }

    getChannel(param1, param2) {
        const guildId = param2 ? param1 : param1.split('/')[0];
        const channelId = param2 ? param2 : param1.split('/')[1];
        return this.client.channels.cache.find(c => c.guild.id === guildId && c.id === channelId);
    }

    getChannels(ids) {
        return this.client.channels.cache.filter(c => ids.includes(`${c.guild.id}/${c.id}`));
    }

    formatChannel(channel) {
        return channel ? `${channel.name}(${channel.guild.name})` : ''
    }

    formatMentionIds(ids) {
        return ids ? ids.map(id => `<@&${id}>`).join(' ') : ''
    }

    generateForwardingMessage(originalMessage) {
        return {
            embed: {
                author: {
                    name: `${originalMessage.author.username} from ${originalMessage.guild.name}`,
                    icon_url: originalMessage.author.avatarURL()
                },
                description: '',
                color: 7506394,
            }
        }
    }

    async log(lines) {
        lines.forEach(line => console.log(line));
        const logChannel = this.getChannel(this.loggerId);
        if (logChannel) {
            await logChannel.send(lines.join('\r'));
        }
    }

    async onReady() {
        const lines = [`Bot is ready.`];
        Object.entries(this.rules).forEach(([sender, receivers]) => {
            receivers.forEach(receiver => {
                const from = this.formatChannel(this.getChannel(sender));
                const to = this.formatChannel(this.getChannel(receiver.id));
                lines.push(`${from} => ${to}`)
            });
        });
        await this.log(lines);
    }

    async onMessage(message) {
        if (message.author.bot) {
            return;
        }
        const guildChannelId = `${message.channel.guild.id}/${message.channel.id}`
        const receivers = this.rules[guildChannelId];
        if (!receivers) {
            return;
        }
        if (message.content.match(this.REGEX_MESSAGE)) {
            const lines = [`Forward new message.`].concat(message.content.split('\r'));
            lines.push(`From: ${message.channel.name}(${message.channel.guild.name})`);
            const toList = [];
            const newMessage = this.generateForwardingMessage(message);

            await Promise.all(receivers.map(async (receiver) => {
                const channel = this.getChannel(receiver.id);
                if (channel) {
                    const msg = await channel.send(
                        receiver.mentionIds ? 
                        `${this.formatMentionIds(receiver.mentionIds)}\r${message.content}` : 
                        `${message.content}`,
                        newMessage);
                    lines.push(`To:   ${channel.name}(${channel.guild.name})`);
                    toList.push({
                        guild: channel.guild.id,
                        channel: channel.id,
                        message: msg.id, 
                        mentionIds: receiver.mentionIds
                    });
                }
            }));
            this.forwardedMessageMap.push({
                guild: message.channel.guild.id,
                channel: message.channel.id,
                message: message.id,
                to: toList
            });
            if (this.forwardedMessageMap.length > 100) {
                this.forwardedMessageMap.shift();
            }
            await this.log(lines);
        }
    }
    async onMessageUpdate(oldMessage, message) {
        if (message.author.bot) {
            return;
        }
        const guildChannelId = `${message.channel.guild.id}/${message.channel.id}`
        const receivers = this.rules[guildChannelId];
        if (!receivers) {
            return;
        }
        const forward = this.forwardedMessageMap.find(
            m => m.guild == message.channel.guild.id &&
                 m.channel == message.channel.id &&
                 m.message == message.id
        );
        if (forward) {
            const lines = [`Modify message.`].concat(message.content.split('\r'));
            const newMessage = this.generateForwardingMessage(message);
            await Promise.all(forward.to.map(async (to) => {
                const channel = this.getChannel(to.guild, to.channel);
                if (channel) {
                    const msg = channel.messages.cache.get(to.message);
                    if (msg) {
                        await msg.edit(
                            to.mentionIds ? 
                            `${this.formatMentionIds(to.mentionIds)}\r${message.content}` : 
                            `${message.content}`,
                             newMessage);
                    }
                }
            }));
            await this.log(lines);
        }
    }
    async onMessageDelete(message) {
        if (message.author.bot) {
            return;
        }
        const guildChannelId = `${message.channel.guild.id}/${message.channel.id}`
        const receivers = this.rules[guildChannelId];
        if (!receivers) {
            return;
        }
        const forward = this.forwardedMessageMap.find(
            m => m.guild == message.channel.guild.id &&
                 m.channel == message.channel.id &&
                 m.message == message.id
        );
        if (forward) {
            const lines = [`Delete message.`].concat(message.content.split('\r'));
            await Promise.all(forward.to.map(async (to) => {
                const channel = this.getChannel(to.guild, to.channel);
                if (channel) {
                    const msg = channel.messages.cache.get(to.message);
                    if (msg) {
                        await msg.delete();
                    }
                }
            }));
            await this.log(lines);
        }
    }

    login(token) {
        this.client.on('ready', () => {
            this.onReady();
        });
        
        this.client.on('message', message => {
            this.onMessage(message);
        });
        
        this.client.on('messageUpdate', (oldMessage, message) => {
            this.onMessageUpdate(oldMessage, message);
        });
        
        this.client.on('messageDelete', (message) => {
            this.onMessageDelete(message);
        });
        
        this.client.login(token);
    }
}
