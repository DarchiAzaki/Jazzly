const { Client, GatewayIntentBits, Collection } = require('discord.js');
const DisTubeManager = require('./audio/DisTubeManager');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');

class JazzlyClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    /** @type {Collection<string, object>} */
    this.commands = new Collection();
    /** @type {Collection<string, string>} */
    this.aliases = new Collection();
    /** @type {Collection<string, object>} */
    this.searchSessions = new Collection();

    // Initialize Standalone DisTube Audio Manager
    this.audioManager = new DisTubeManager(this);
    this.distube = this.audioManager.distube;
    this.manager = this.audioManager;
  }

  init() {
    // 1. Load commands & aliases
    loadCommands(this);

    // 2. Load and register event listeners (interactionCreate, messageCreate, ready, voiceStateUpdate)
    loadEvents(this);
  }
}

module.exports = JazzlyClient;
