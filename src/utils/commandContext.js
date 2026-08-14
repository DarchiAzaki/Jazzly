const { MessageFlags } = require('discord.js');
const { buildSuccessContainer, buildErrorContainer } = require('../components/componentsV2');

class CommandContext {
  /**
   * @param {object} options
   * @param {import('../client')} options.client
   * @param {import('discord.js').ChatInputCommandInteraction|null} [options.interaction]
   * @param {import('discord.js').Message|null} [options.message]
   * @param {string[]} [options.args]
   */
  constructor({ client, interaction = null, message = null, args = [] }) {
    this.client = client;
    this.interaction = interaction;
    this.message = message;
    this.args = args;
    this.isInteraction = Boolean(interaction);

    this.user = interaction ? interaction.user : message.author;
    this.member = interaction ? interaction.member : message.member;
    this.guild = interaction ? interaction.guild : message.guild;
    this.channel = interaction ? interaction.channel : message.channel;
    this.voiceChannel = this.member?.voice?.channel || null;
  }

  getString(optionName, argIndex = 0, defaultValue = null) {
    if (this.isInteraction) {
      const val = this.interaction.options.getString(optionName);
      return val !== null ? val : defaultValue;
    }
    return this.args[argIndex] !== undefined ? this.args.slice(argIndex).join(' ') : defaultValue;
  }

  getInteger(optionName, argIndex = 0, defaultValue = null) {
    if (this.isInteraction) {
      const val = this.interaction.options.getInteger(optionName);
      return val !== null ? val : defaultValue;
    }
    const val = parseInt(this.args[argIndex], 10);
    return !isNaN(val) ? val : defaultValue;
  }

  getUser(optionName, argIndex = 0, defaultValue = null) {
    if (this.isInteraction) {
      const val = this.interaction.options.getUser(optionName);
      return val !== null ? val : defaultValue;
    }
    const mention = this.args[argIndex];
    if (!mention) return defaultValue;
    const match = mention.match(/^<@!?(\d+)>$/);
    if (match) {
      return this.client.users.cache.get(match[1]) || defaultValue;
    }
    return defaultValue;
  }

  async defer(ephemeral = false) {
    if (this.isInteraction && !this.interaction.deferred && !this.interaction.replied) {
      await this.interaction.deferReply({ ephemeral });
    }
  }

  /**
   * Universal response sender supporting Components V2
   */
  async reply(payload) {
    if (this.isInteraction) {
      if (this.interaction.deferred) {
        return await this.interaction.editReply(payload);
      } else if (this.interaction.replied) {
        return await this.interaction.followUp(payload);
      } else {
        return await this.interaction.reply(payload);
      }
    } else {
      return await this.message.reply(payload);
    }
  }

  /**
   * Modern Components V2 success container
   */
  async sendSuccess(title, description, customActionRows = null) {
    const payload = buildSuccessContainer(title, description, customActionRows);
    return this.reply(payload);
  }

  /**
   * Modern Components V2 error container
   */
  async sendError(title, description, ephemeral = true) {
    const payload = buildErrorContainer(title, description);

    if (this.isInteraction) {
      if (this.interaction.deferred) {
        return await this.interaction.editReply(payload);
      } else if (this.interaction.replied) {
        return await this.interaction.followUp({ ...payload, flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
      } else {
        return await this.interaction.reply({ ...payload, flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
      }
    } else {
      return await this.message.reply(payload);
    }
  }
}

module.exports = CommandContext;
