const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'playskip',
  description: 'Skips the current song and plays the song you requested immediately',
  category: 'music',
  aliases: ['ps', 'pskip', 'playnow', 'pn'],
  slashData: new SlashCommandBuilder()
    .setName('playskip')
    .setDescription('Skips the current song and plays the song you requested')
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
      return ctx.sendError('Missing Query', 'Please provide a song name or URL to play!');
    }

    if (!ctx.voiceChannel) {
      return ctx.sendError('Voice Channel Required', 'You must be in a voice channel!');
    }

    await ctx.defer();

    try {
      await ctx.client.distube.play(ctx.voiceChannel, query, {
        member: ctx.member,
        textChannel: ctx.channel,
        skip: true
      });

      return ctx.sendSuccess('⏭️ Play Skip', `Skipping current track and playing **${query}** immediately.`);
    } catch (err) {
      return ctx.sendError('Playback Error', `Could not play track: \`${err.message}\``);
    }
  }
};
