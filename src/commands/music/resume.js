const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'resume',
  description: 'Resumes the current song',
  category: 'music',
  aliases: [],
  slashData: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resumes the current song'),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (!queue || !queue.songs[0]) {
      return ctx.sendError('Nothing Playing', 'There is no music currently playing in this server.');
    }

    if (!ctx.voiceChannel || ctx.voiceChannel.id !== queue.voiceChannel?.id) {
      return ctx.sendError('Voice Channel Mismatch', 'You must be in the same voice channel as the bot to resume music.');
    }

    if (!queue.paused) {
      return ctx.sendError('Not Paused', 'The music player is not currently paused.');
    }

    queue.resume();
    return ctx.sendSuccess('▶️ Music Resumed', `Resumed playback of **[${queue.songs[0].name}](${queue.songs[0].url})**.`);
  }
};
