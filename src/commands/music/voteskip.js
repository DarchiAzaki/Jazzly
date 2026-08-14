const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  name: 'voteskip',
  description: 'Vote to skip the current track (requires 50% of listeners in VC)',
  category: 'music',
  aliases: ['skip', 's', 'vs', 'next'],
  slashData: new SlashCommandBuilder()
    .setName('voteskip')
    .setDescription('Vote to skip the current track (requires 50% of users in VC to vote)'),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (!queue || !queue.songs[0]) {
      return ctx.sendError('Nothing Playing', 'There is no track currently playing.');
    }

    if (!ctx.voiceChannel || ctx.voiceChannel.id !== queue.voiceChannel?.id) {
      return ctx.sendError('Voice Channel Mismatch', 'You must be in the same voice channel to vote skip.');
    }

    const listeners = ctx.voiceChannel.members.filter((m) => !m.user.bot);
    const totalListeners = Math.max(1, listeners.size);
    const settings = db.getGuildSettings(ctx.guild.id);
    const requiredPercent = (settings.voteSkipPercent || 50) / 100;
    const requiredVotes = Math.ceil(totalListeners * requiredPercent);

    if (!queue.data) queue.data = {};
    if (!queue.data.voteSkips) queue.data.voteSkips = new Set();

    if (queue.data.voteSkips.has(ctx.user.id)) {
      return ctx.sendError('Already Voted', `You have already voted to skip! **[${queue.data.voteSkips.size}/${requiredVotes}]** votes collected.`);
    }

    queue.data.voteSkips.add(ctx.user.id);

    if (queue.data.voteSkips.size >= requiredVotes) {
      const skippedSong = queue.songs[0];
      if (queue.songs.length <= 1) {
        queue.stop();
      } else {
        queue.skip();
      }
      queue.data.voteSkips = new Set();
      return ctx.sendSuccess('⏭️ Track Skipped', `Vote skip passed! **(${requiredVotes}/${requiredVotes})** votes reached. Skipping **${skippedSong.name}**...`);
    }

    return ctx.sendSuccess('🗳️ Vote Added', `Added your vote to skip! **(${queue.data.voteSkips.size}/${requiredVotes})** votes needed.`);
  }
};
