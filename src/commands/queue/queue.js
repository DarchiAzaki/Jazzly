const { SlashCommandBuilder } = require('discord.js');
const { buildQueueContainer } = require('../../components/componentsV2');

module.exports = {
  name: 'queue',
  description: 'View the current music queue and upcoming tracks',
  category: 'queue',
  aliases: ['q'],
  slashData: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('View the current music queue')
    .addIntegerOption((option) =>
      option
        .setName('page')
        .setDescription('Page number')
        .setMinValue(1)
        .setRequired(false)
    ),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (!queue || queue.songs.length === 0) {
      return ctx.sendError('Queue is Empty', 'The music queue is currently empty. Add some tracks with `/play`!');
    }

    const page = ctx.getInteger('page', 0, 1) || 1;
    const payload = buildQueueContainer(queue, ctx.guild, page, 10);

    return ctx.reply(payload);
  }
};
