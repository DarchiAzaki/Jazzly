const { SlashCommandBuilder } = require('discord.js');
const { buildNowPlayingComponentsV2 } = require('../../components/componentsV2');

module.exports = {
  name: 'nowplaying',
  description: 'Shows information about the currently playing track',
  category: 'music',
  aliases: ['np'],
  slashData: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Shows information about the currently playing track'),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (!queue || !queue.songs[0]) {
      return ctx.sendError('Nothing Playing', 'There is no track currently playing in this server.');
    }

    const payload = buildNowPlayingComponentsV2(queue, queue.songs[0], ctx.user.id);
    return ctx.reply(payload);
  }
};
