const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'remove',
  description: 'Remove a song from the upcoming queue by its position number',
  category: 'queue',
  aliases: ['rm'],
  slashData: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove song from queue')
    .addIntegerOption((option) =>
      option
        .setName('position')
        .setDescription('Position of the upcoming song to remove (1-indexed)')
        .setMinValue(1)
        .setRequired(true)
    ),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (!queue || queue.songs.length <= 1) {
      return ctx.sendError('Queue is Empty', 'There are no upcoming songs in the queue.');
    }

    if (!ctx.voiceChannel || ctx.voiceChannel.id !== queue.voiceChannel?.id) {
      return ctx.sendError('Voice Channel Mismatch', 'You must be in the same voice channel.');
    }

    const pos = ctx.getInteger('position', 0);
    const upcomingCount = queue.songs.length - 1;

    if (pos === null || pos < 1 || pos > upcomingCount) {
      return ctx.sendError('Invalid Position', `Please specify a valid position between **1** and **${upcomingCount}**.`);
    }

    const removed = queue.songs.splice(pos, 1);
    if (removed.length === 0) {
      return ctx.sendError('Remove Failed', 'Could not remove track from queue.');
    }

    return ctx.sendSuccess('🗑️ Song Removed', `Removed **[${removed[0].name}](${removed[0].url})** from position **#${pos}**.`);
  }
};
