const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'move',
  description: 'Move a song from one position to another in the queue',
  category: 'queue',
  aliases: ['m'],
  slashData: new SlashCommandBuilder()
    .setName('move')
    .setDescription('Move song in queue')
    .addIntegerOption((option) =>
      option
        .setName('from')
        .setDescription('Current position of the upcoming song (1-indexed)')
        .setMinValue(1)
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('to')
        .setDescription('Target position for the song (1-indexed)')
        .setMinValue(1)
        .setRequired(true)
    ),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (!queue || queue.songs.length <= 1) {
      return ctx.sendError('Queue is Empty', 'There are no upcoming songs in the queue to move.');
    }

    if (!ctx.voiceChannel || ctx.voiceChannel.id !== queue.voiceChannel?.id) {
      return ctx.sendError('Voice Channel Mismatch', 'You must be in the same voice channel.');
    }

    const fromPos = ctx.getInteger('from', 0);
    const toPos = ctx.getInteger('to', 1);

    const upcomingCount = queue.songs.length - 1;
    if (fromPos === null || toPos === null) {
      return ctx.sendError('Invalid Arguments', 'Please specify both source and target positions, e.g. `/move 3 1`.');
    }

    if (fromPos < 1 || fromPos > upcomingCount || toPos < 1 || toPos > upcomingCount) {
      return ctx.sendError('Invalid Position', `Positions must be between **1** and **${upcomingCount}**.`);
    }

    // In DisTube, queue.songs[0] is currently playing, upcoming starts at index 1
    const [movedTrack] = queue.songs.splice(fromPos, 1);
    queue.songs.splice(toPos, 0, movedTrack);

    return ctx.sendSuccess('🔀 Song Moved', `Moved **[${movedTrack.name}](${movedTrack.url})** from position **#${fromPos}** to **#${toPos}**.`);
  }
};
