const { SlashCommandBuilder } = require('discord.js');
const { buildNowPlayingComponentsV2 } = require('../../components/componentsV2');

module.exports = {
  name: 'control',
  description: 'Opens the interactive music controls panel',
  category: 'music',
  aliases: ['ct', 'c'],
  slashData: new SlashCommandBuilder()
    .setName('control')
    .setDescription('Open music controls panel'),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (!queue || !queue.songs[0]) {
      return ctx.sendError('Nothing Playing', 'There is no active music session to control.');
    }

    const payload = buildNowPlayingComponentsV2(queue, queue.songs[0], ctx.user.id);
    return ctx.reply(payload);
  }
};
