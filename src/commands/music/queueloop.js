const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'queueloop',
  description: 'Loops the entire music queue',
  category: 'music',
  aliases: ['qloop', 'loopqueue', 'loopq'],
  slashData: new SlashCommandBuilder()
    .setName('queueloop')
    .setDescription('Loop the entire queue'),

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

    const nextMode = queue.repeatMode === 2 ? 0 : 2;
    queue.setRepeatMode(nextMode);

    if (nextMode === 2) {
      return ctx.sendSuccess('🔁 Queue Loop Enabled', 'The entire queue will now loop continuously.');
    } else {
      return ctx.sendSuccess('🔁 Queue Loop Disabled', 'Queue loop has been turned off.');
    }
  }
};
