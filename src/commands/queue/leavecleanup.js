const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'leavecleanup',
  description: "Removes absent users' songs from the queue",
  category: 'queue',
  aliases: ['lc'],
  slashData: new SlashCommandBuilder()
    .setName('leavecleanup')
    .setDescription("Removes absent user's songs from the queue"),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (!queue || queue.songs.length <= 1) {
      return ctx.sendError('Queue is Empty', 'There are no upcoming tracks in the queue.');
    }

    if (!ctx.voiceChannel || ctx.voiceChannel.id !== queue.voiceChannel?.id) {
      return ctx.sendError('Voice Channel Mismatch', 'You must be in the same voice channel.');
    }

    const voiceMembers = ctx.voiceChannel.members;
    const current = queue.songs[0];
    const upcoming = queue.songs.slice(1);
    const initialLen = upcoming.length;
    const remainingUpcoming = [];

    for (const song of upcoming) {
      const requesterId = song.user?.id || song.member?.id;
      if (voiceMembers.has(requesterId)) {
        remainingUpcoming.push(song);
      }
    }

    queue.songs = [current, ...remainingUpcoming];
    const removedCount = initialLen - remainingUpcoming.length;

    if (removedCount === 0) {
      return ctx.sendSuccess('🧹 Clean Queue', 'All queued tracks were requested by users currently in the voice channel.');
    }

    return ctx.sendSuccess('🧹 Queue Cleaned', `Removed **${removedCount}** track(s) requested by users who left the voice channel.`);
  }
};
