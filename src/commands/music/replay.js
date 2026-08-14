const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'replay',
  description: 'Resets the progress of the current song back to 0:00',
  category: 'music',
  aliases: [],
  slashData: new SlashCommandBuilder()
    .setName('replay')
    .setDescription('Resets the progress of the current song'),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (!queue || !queue.songs[0]) {
      return ctx.sendError('Nothing Playing', 'There is no track currently playing.');
    }

    if (!ctx.voiceChannel || ctx.voiceChannel.id !== queue.voiceChannel?.id) {
      return ctx.sendError('Voice Channel Mismatch', 'You must be in the same voice channel.');
    }

    queue.seek(0);
    return ctx.sendSuccess('🔄 Track Restarted', `Replaying **[${queue.songs[0].name}](${queue.songs[0].url})** from the beginning.`);
  }
};
