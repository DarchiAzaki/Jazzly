const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'skipto',
  description: 'Skips to a certain position in the queue',
  category: 'queue',
  aliases: ['st'],
  slashData: new SlashCommandBuilder()
    .setName('skipto')
    .setDescription('Skips to a certain position in the queue')
    .addIntegerOption((option) =>
      option
        .setName('position')
        .setDescription('Queue position to skip to (1-indexed)')
        .setMinValue(1)
        .setRequired(true)
    ),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (!queue || queue.songs.length <= 1) {
      return ctx.sendError('Queue is Empty', 'There are no upcoming tracks to skip to.');
    }

    if (!ctx.voiceChannel || ctx.voiceChannel.id !== queue.voiceChannel?.id) {
      return ctx.sendError('Voice Channel Mismatch', 'You must be in the same voice channel.');
    }

    const pos = ctx.getInteger('position', 0);
    const upcomingCount = queue.songs.length - 1;

    if (pos === null || pos < 1 || pos > upcomingCount) {
      return ctx.sendError('Invalid Position', `Please enter a valid queue position between **1** and **${upcomingCount}**.`);
    }

    const targetSong = queue.songs[pos];
    // Remove songs between current (0) and target (pos)
    queue.songs.splice(1, pos - 1);
    queue.skip();

    return ctx.sendSuccess('⏭️ Skipped To Song', `Skipped forward to position **#${pos}**: **[${targetSong.name}](${targetSong.url})**.`);
  }
};
