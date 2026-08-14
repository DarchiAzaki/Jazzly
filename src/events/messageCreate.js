const CommandContext = require('../utils/commandContext');
const db = require('../database/db');
const config = require('../config');
const logger = require('../utils/logger');

module.exports = {
  name: 'messageCreate',
  once: false,
  /**
   * @param {import('../client')} client
   * @param {import('discord.js').Message} message
   */
  async execute(client, message) {
    if (message.author.bot || !message.guild) return;

    const guildSettings = db.getGuildSettings(message.guild.id);
    const prefix = guildSettings.prefix || config.discord.defaultPrefix;

    if (!message.content.startsWith(prefix)) return;

    const rawArgs = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = rawArgs.shift()?.toLowerCase();
    if (!cmdName) return;

    const command = client.commands.get(cmdName) ||
      client.commands.get(client.aliases.get(cmdName));

    if (!command) return;

    const ctx = new CommandContext({ client, message, args: rawArgs });

    try {
      await command.execute(ctx);
    } catch (err) {
      logger.error(`Error executing prefix command ${prefix}${cmdName}:`, err);
      await ctx.sendError('Command Execution Error', 'An unexpected error occurred while executing this command.');
    }
  }
};
