const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'Clears all upcoming songs from the music queue',
  category: 'queue',
  aliases: [],
  slashData: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clears the music queue'),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (!queue || queue.songs.length <= 1) {
      return ctx.sendError('Queue is Empty', 'There are no upcoming songs in the queue to clear.');
    }

    if (!ctx.voiceChannel || ctx.voiceChannel.id !== queue.voiceChannel?.id) {
      return ctx.sendError('Voice Channel Mismatch', 'You must be in the same voice channel.');
    }

    const count = queue.songs.length - 1;
    queue.songs.splice(1);

    return ctx.sendSuccess('🗑️ Queue Cleared', `Removed all **${count}** upcoming tracks from the queue.`);
  }
};
