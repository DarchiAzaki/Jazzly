const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'removedupes',
  description: 'Removes duplicate songs from the queue',
  category: 'queue',
  aliases: ['rmd', 'rd', 'drm'],
  slashData: new SlashCommandBuilder()
    .setName('removedupes')
    .setDescription('Removes duplicate songs from the queue'),

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

    const seen = new Set();
    // Keep current song (index 0)
    const current = queue.songs[0];
    seen.add(current.url);

    const upcoming = queue.songs.slice(1);
    const initialLen = upcoming.length;
    const uniqueUpcoming = [];

    for (const song of upcoming) {
      if (!seen.has(song.url)) {
        seen.add(song.url);
        uniqueUpcoming.push(song);
      }
    }

    queue.songs = [current, ...uniqueUpcoming];
    const removedCount = initialLen - uniqueUpcoming.length;

    if (removedCount === 0) {
      return ctx.sendSuccess('✨ No Duplicates', 'There are no duplicate songs in the current queue.');
    }

    return ctx.sendSuccess('✨ Duplicates Removed', `Removed **${removedCount}** duplicate track(s) from the queue.`);
  }
};
