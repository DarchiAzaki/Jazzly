const { ActivityType } = require('discord.js');
const logger = require('../utils/logger');
const config = require('../config');
const { getDatabaseStatus } = require('../database/connect');

module.exports = {
  name: 'ready',
  once: true,
  /**
   * @param {import('../client')} client
   */
  async execute(client) {
    logger.success(`Logged in as ${client.user.tag} (ID: ${client.user.id})`);

    const dbStatus = getDatabaseStatus() ? 'MongoDB [Connected]' : 'Local Cache [Active]';
    logger.info(`Database Storage: ${dbStatus}`);

    client.user.setPresence({
      activities: [
        {
          name: `${config.discord.defaultPrefix}help | /play`,
          type: ActivityType.Listening
        }
      ],
      status: 'online'
    });
  }
};
