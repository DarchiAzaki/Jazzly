const { SlashCommandBuilder } = require('discord.js');
const { buildHelpContainer } = require('../../components/helpContainer');

module.exports = {
  name: 'help',
  description: 'View the interactive command menu and help center',
  category: 'general',
  aliases: ['h', 'commands'],
  slashData: new SlashCommandBuilder()
    .setName('help')
    .setDescription('View the interactive command menu and help center')
    .addStringOption((option) =>
      option
        .setName('category')
        .setDescription('Command category')
        .setRequired(false)
        .addChoices(
          { name: '🎵 Music', value: 'music' },
          { name: '📜 Queue', value: 'queue' },
          { name: '🎛️ Controls', value: 'controls' },
          { name: '⚙️ Utility', value: 'utility' }
        )
    ),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const categoryChoice = ctx.getString('category', 0, 'music') || 'music';
    const payload = buildHelpContainer(categoryChoice);

    return ctx.reply(payload);
  }
};
