const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'disconnect',
  description: 'Disconnects from the voice channel and clears the queue',
  category: 'music',
  aliases: ['dc', 'leave', 'fuckoff', 'stop'],
  slashData: new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('Disconnects from the voice channel and clears the queue'),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (queue) {
      queue.stop();
    }

    const voice = ctx.client.distube.voices.get(ctx.guild.id);
    if (voice) {
      voice.leave();
    }

    return ctx.sendSuccess('👋 Disconnected', 'Left the voice channel and cleared the music queue.');
  }
};
