const { SlashCommandBuilder } = require('discord.js');
const { createComponentsV2Row } = require('../../components/componentsV2');

module.exports = {
  name: 'play',
  description: 'Plays a track or playlist from YouTube, Spotify, SoundCloud, or keyword search',
  category: 'music',
  aliases: ['p'],
  slashData: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a track or playlist (supports search or links)')
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
      return ctx.sendError('Missing Query', 'Please provide a song name, URL, or playlist link to play!');
    }

    if (!ctx.voiceChannel) {
      return ctx.sendError('Voice Channel Required', 'You must be connected to a voice channel to play music!');
    }

    const permissions = ctx.voiceChannel.permissionsFor(ctx.client.user);
    if (permissions && !permissions.has(['Connect', 'Speak'])) {
      return ctx.sendError('Missing Permissions', 'I do not have permission to join and speak in your voice channel!');
    }

    await ctx.defer();

    try {
      await ctx.client.distube.play(ctx.voiceChannel, query, {
        member: ctx.member,
        textChannel: ctx.channel
      });

      return ctx.sendSuccess('🎵 Request Received', `Searching and playing **${query}** for <@${ctx.user.id}>!`);
    } catch (err) {
      return ctx.sendError('Playback Error', `Could not play track: \`${err.message}\``);
    }
  }
};
