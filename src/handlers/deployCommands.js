const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const logger = require('../utils/logger');
const config = require('../config');

async function deployCommands() {
  const token = process.env.DISCORD_TOKEN || config.discord.token;
  const clientId = process.env.CLIENT_ID || config.discord.clientId;
  const guildId = process.env.GUILD_ID;

  if (!token || !clientId) {
    logger.error('Cannot deploy commands: DISCORD_TOKEN or CLIENT_ID is missing in .env');
    process.exit(1);
  }

  const commands = [];
  const commandsPath = path.join(__dirname, '../commands');
  const categories = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(categoryPath).filter((f) => f.endsWith('.js'));
    for (const file of commandFiles) {
      try {
        const command = require(path.join(categoryPath, file));
        if (command.slashData) {
          commands.push(command.slashData.toJSON());
        }
      } catch (err) {
        logger.error(`Error reading slashData for ${file}:`, err.message);
      }
    }
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    logger.info(`Started refreshing ${commands.length} application (/) commands...`);

    if (guildId) {
      // Guild-specific fast deployment
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      logger.success(`Successfully reloaded ${data.length} guild (/) commands for guild ${guildId}.`);
    } else {
      // Global deployment
      const data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      logger.success(`Successfully reloaded ${data.length} global (/) commands.`);
    }
  } catch (error) {
    logger.error('Error deploying slash commands:', error);
  }
}

if (require.main === module) {
  deployCommands();
}

module.exports = { deployCommands };
