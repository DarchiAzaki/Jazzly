const fs = require('fs');
const path = require('path');
const CommandContext = require('../utils/commandContext');
const db = require('../database/db');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Loads all command files from src/commands recursively
 * @param {import('../client')} client
 */
function loadCommands(client) {
  const commandsPath = path.join(__dirname, '../commands');
  const categories = fs.readdirSync(commandsPath);

  let loadedCount = 0;
  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(categoryPath).filter((f) => f.endsWith('.js'));
    for (const file of commandFiles) {
      try {
        const command = require(path.join(categoryPath, file));
        if (command.name && typeof command.execute === 'function') {
          client.commands.set(command.name.toLowerCase(), command);

          if (Array.isArray(command.aliases)) {
            for (const alias of command.aliases) {
              client.aliases.set(alias.toLowerCase(), command.name.toLowerCase());
            }
          }
          loadedCount++;
        }
      } catch (err) {
        logger.error(`Failed to load command file ${file}:`, err);
      }
    }
  }

  logger.success(`Loaded ${loadedCount} commands and ${client.aliases.size} aliases successfully.`);
}

/**
 * Setup interaction and message command listeners
 * @param {import('../client')} client
 */
function setupCommandListeners(client) {
  // 1. Slash Command Interaction
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName.toLowerCase());
    if (!command) return;

    const ctx = new CommandContext({ client, interaction });

    try {
      await command.execute(ctx);
    } catch (err) {
      logger.error(`Error executing slash command /${interaction.commandName}:`, err);
      if (!ctx.replied && !ctx.deferred) {
        await ctx.sendError('Command Error', 'An unexpected error occurred while executing this command.');
      }
    }
  });

  // 2. Prefix Text Message Commands
  client.on('messageCreate', async (message) => {
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
      await ctx.sendError('Command Error', 'An unexpected error occurred while executing this command.');
    }
  });
}

module.exports = {
  loadCommands,
  setupCommandListeners
};
