const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'shuffle',
  description: 'Shuffles the current music queue',
  category: 'queue',
  aliases: [],
  slashData: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffles the current music queue'),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (!queue || queue.songs.length <= 2) {
      return ctx.sendError('Not Enough Tracks', 'You need at least 2 upcoming tracks in the queue to shuffle.');
    }

    if (!ctx.voiceChannel || ctx.voiceChannel.id !== queue.voiceChannel?.id) {
      return ctx.sendError('Voice Channel Mismatch', 'You must be in the same voice channel.');
    }

    queue.shuffle();
    return ctx.sendSuccess('🔀 Queue Shuffled', `Successfully randomized the order of **${queue.songs.length - 1}** upcoming tracks.`);
  }
};
