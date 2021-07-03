const Discord = require('discord.js');
const axios = require('axios');
const dayjs = require('dayjs')
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.tz.setDefault('Asia/Tokyo')

module.exports = class AToursBot {
  constructor(loggerId, accessKey, accessRegion) {
    // regular expression of the message to be forwarded
    this.REGEX_MESSAGE = /.+/;
    this.client = new Discord.Client();
    this.loggerId = loggerId;
    this.rules = {};
    this.replaceList = {};
    this.forwardedMessageMap = [];
    this.accessKey = accessKey;
    this.accessRegion = accessRegion;
  }

  addRule(senderId, receivers, replaceList = []) {
    this.rules[senderId] = receivers;
    this.replaceList[senderId] = replaceList;
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

  generateForwardingMessage(originalMessage, authorDisplayName, isSameServer = false, translatedContent) {
    return {
      embed: {
        author: {
          name: isSameServer ?
            `${authorDisplayName}` :
            `${authorDisplayName} from ${originalMessage.guild.name}`,
          icon_url: originalMessage.author.displayAvatarURL()
        },
        description: translatedContent,
        color: 7506394,
      }
    }
  }

  async getAuthorDisplayName(message) {
    const member = await message.guild.member(message.author);
    return member && member.nickname ? member.nickname : message.author.username;
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

  async translate(message, replaceList) {
    const url = 'https://api.cognitive.microsofttranslator.com/translate';
    try {
      let preprocessMessage = message;
      for (const item of replaceList) {
        preprocessMessage = preprocessMessage.replace(item.match, ` _${item.key}_ `);
      }

      const response = await axios.post(url, [
        { 'Text': preprocessMessage }
      ], {
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': this.accessKey,
            'Ocp-Apim-Subscription-Region': this.accessRegion
          },
          params: {
            'api-version': '3.0',
            'from': 'ja',
            'to': 'en'
          }
        });
      const translations = response.data[0]['translations'];
      const translation = translations.find(t => t.to === 'en');

      const translatedMessage = translation.text;

      let postprocessMessage = translatedMessage;
      for (const item of replaceList) {
        postprocessMessage = postprocessMessage.split(`_${item.key}_`).join(item.replace);
      }

      await this.log([preprocessMessage, translatedMessage, postprocessMessage]);
      return postprocessMessage;
    } catch (err) {
      await this.log([`translation error: ${err.message}`]);
      return message;
    }
  }

  async onMessage(message) {
    if (message.author.bot) {
      if (message.channel.type === 'news') {
        try {
          await message.crosspost()
          await this.log([`published message.content: ${message.content}`])
        }
        catch (err) {
          await this.log([`error: ${err.message}`])
        }
      }
      return;
    }
    const guildChannelId = `${message.channel.guild.id}/${message.channel.id}`
    const receivers = this.rules[guildChannelId];
    const replaceList = this.replaceList[guildChannelId];
    if (!receivers) {
      return;
    }
    if (message.content.match(this.REGEX_MESSAGE)) {
      const lines = [`Forward new message.`].concat(message.content.split('\r'));
      lines.push(`From: ${message.channel.name}(${message.channel.guild.name})`);
      const toList = [];

      const authorDisplayName = await this.getAuthorDisplayName(message);

      let translatedContent = message.content;
      if (receivers.some(receiver => receiver.translate)) {
        translatedContent = await this.translate(message.content, replaceList);
      }

      await Promise.all(receivers.map(async (receiver) => {
        const channel = this.getChannel(receiver.id);
        if (channel) {
          const newMessage = this.generateForwardingMessage(message, authorDisplayName, channel.guild.id == message.channel.guild.id, receiver.translate ? translatedContent : '');
          if (channel.type === 'news') {
            newMessage.embed.fields = [{
              name: 'Created At',
              value: dayjs(message.createdAt).tz('Asia/Tokyo').format('MM/DD HH:mm JST'),
              inline: true
            }]
          }
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
            mentionIds: receiver.mentionIds,
            translate: receiver.translate
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
    const replaceList = this.replaceList[guildChannelId];
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

      const authorDisplayName = await this.getAuthorDisplayName(message);

      let translatedContent = message.content;
      if (forward.to.some(to => to.translate)) {
        translatedContent = await this.translate(message.content, replaceList);
      }

      await Promise.all(forward.to.map(async (to) => {
        const channel = this.getChannel(to.guild, to.channel);
        if (channel) {
          const msg = channel.messages.cache.get(to.message);
          if (msg) {
            const newMessage = this.generateForwardingMessage(message, authorDisplayName, channel.guild.id == message.channel.guild.id, to.translate ? translatedContent : '');
            if (channel.type === 'news') {
              newMessage.embed.fields = [{
                name: 'Created At',
                value: dayjs(message.createdAt).tz('Asia/Tokyo').format('MM/DD HH:mm JST'),
                inline: true
              }, {
                name: 'Edited At',
                value: dayjs(message.editedAt).tz('Asia/Tokyo').format('MM/DD HH:mm JST'),
                inline: true
              }]
            }
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
