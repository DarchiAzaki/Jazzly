const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'playtop',
  description: 'Adds a song with the given name/url to the top of the queue',
  category: 'music',
  aliases: ['pt', 'ptop'],
  slashData: new SlashCommandBuilder()
    .setName('playtop')
    .setDescription('Adds a song with the given name/url on the top of the queue')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Song title, keywords, or URL')
        .setRequired(true)
    ),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const query = ctx.getString('query', 0);
    if (!query) {
      return ctx.sendError('Missing Query', 'Please provide a song name or URL to play on top!');
    }

    if (!ctx.voiceChannel) {
      return ctx.sendError('Voice Channel Required', 'You must be in a voice channel!');
    }

    await ctx.defer();

    try {
      await ctx.client.distube.play(ctx.voiceChannel, query, {
        member: ctx.member,
        textChannel: ctx.channel,
        position: 1
      });

      return ctx.sendSuccess('🔥 Play Top', `Enqueued **${query}** directly at position **#1** (playing next).`);
    } catch (err) {
      return ctx.sendError('Playback Error', `Could not add track: \`${err.message}\``);
    }
  }
};
