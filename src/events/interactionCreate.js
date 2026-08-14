const CommandContext = require('../utils/commandContext');
const { handleComponentInteraction } = require('../handlers/componentHandler');
const logger = require('../utils/logger');

module.exports = {
  name: 'interactionCreate',
  once: false,
  /**
   * @param {import('../client')} client
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(client, interaction) {
    // 1. Handle Slash Command Interactions
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName.toLowerCase());
      if (!command) {
        return interaction.reply({ content: '❌ Unknown command.', ephemeral: true });
      }

      const ctx = new CommandContext({ client, interaction });

      try {
        await command.execute(ctx);
      } catch (err) {
        logger.error(`Error executing slash command /${interaction.commandName}:`, err);
        if (!ctx.replied && !ctx.deferred) {
          await ctx.sendError('Command Execution Error', 'An unexpected error occurred while running this command.');
        }
      }
      return;
    }

    // 2. Handle Components v2 Global Dismiss Button
    if (interaction.isButton() && interaction.customId === 'component_dismiss') {
      try {
        await interaction.message.delete();
      } catch {
        await interaction.deferUpdate();
      }
      return;
    }

    // 3. Handle Interactive Components (Buttons, Select Menus, Modals)
    if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
      await handleComponentInteraction(client, interaction);
    }
  }
};
