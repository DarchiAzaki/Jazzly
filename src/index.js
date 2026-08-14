require('dotenv').config();
const JazzlyClient = require('./client');
const { connectDatabase } = require('./database/connect');
const logger = require('./utils/logger');
const config = require('./config');

console.log(`
\x1b[36m=======================================================
   🎵  ${config.bot.name}  -  v${config.bot.version}
   Standalone DisTube + yt-dlp Music Engine (100% Local)
=======================================================\x1b[0m
`);

async function bootstrap() {
  // 1. Connect Database (MongoDB with Local Cache Sync)
  await connectDatabase();

  // 2. Initialize Discord Client with Standalone DisTube
  const client = new JazzlyClient();
  client.init();

  const token = process.env.DISCORD_TOKEN || config.discord.token;

  if (!token || token === 'your_discord_bot_token_here') {
    logger.warn('No valid DISCORD_TOKEN found in .env file.');
    logger.info('Please configure your bot token in .env before launching.');
  } else {
    client.login(token).catch((err) => {
      logger.error('Failed to log in to Discord:', err.message);
    });
  }

  // Graceful Shutdown
  const shutdown = () => {
    logger.info('Shutting down bot gracefully...');
    for (const [, queue] of client.distube.queues.collection) {
      queue.stop();
    }
    client.destroy();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Global Exception Handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
});

bootstrap().catch((err) => {
  logger.error('Bootstrap error:', err);
});
