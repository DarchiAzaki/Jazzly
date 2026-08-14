const { SlashCommandBuilder } = require('discord.js');
const { buildEffectsContainer } = require('../../components/componentsV2');

module.exports = {
  name: 'effects',
  description: 'Control audio effects and equalizer for enhanced music experience',
  category: 'music',
  aliases: [],
  slashData: new SlashCommandBuilder()
    .setName('effects')
    .setDescription('Control audio effects for enhanced music experience'),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (!queue || !queue.songs[0]) {
      return ctx.sendError('Nothing Playing', 'There is no music currently playing to apply effects to.');
    }

    const payload = buildEffectsContainer(queue);
    return ctx.reply(payload);
  }
};
