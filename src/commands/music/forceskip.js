const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'forceskip',
  description: 'Force skips current track immediately',
  category: 'music',
  aliases: ['fs', 'fskip'],
  slashData: new SlashCommandBuilder()
    .setName('forceskip')
    .setDescription('Force skips current track'),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (!queue || !queue.songs[0]) {
      return ctx.sendError('Nothing Playing', 'There is no track currently playing.');
    }

    if (!ctx.voiceChannel || ctx.voiceChannel.id !== queue.voiceChannel?.id) {
      return ctx.sendError('Voice Channel Mismatch', 'You must be in the same voice channel to skip.');
    }

    const skippedTrack = queue.songs[0];
    if (queue.songs.length <= 1) {
      queue.stop();
    } else {
      queue.skip();
    }

    return ctx.sendSuccess('⏭️ Force Skipped', `Force skipped **[${skippedTrack.name}](${skippedTrack.url})**.`);
  }
};
