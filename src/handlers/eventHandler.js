const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Loads and registers all event handlers from src/events
 * @param {import('../client')} client
 */
function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../events');
  if (!fs.existsSync(eventsPath)) return;

  const eventFiles = fs.readdirSync(eventsPath).filter((f) => f.endsWith('.js'));
  let count = 0;

  for (const file of eventFiles) {
    try {
      const event = require(path.join(eventsPath, file));
      if (event.name && typeof event.execute === 'function') {
        if (event.once) {
          client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
          client.on(event.name, (...args) => event.execute(client, ...args));
        }
        count++;
      }
    } catch (err) {
      logger.error(`Error loading event file ${file}:`, err);
    }
  }

  logger.success(`Loaded ${count} event listeners successfully.`);
}

module.exports = { loadEvents };
