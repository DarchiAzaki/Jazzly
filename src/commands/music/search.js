const { SlashCommandBuilder } = require('discord.js');
const YouTube = require('youtube-sr').default;
const { createSearchSelectMenu } = require('../../components/searchSelect');

module.exports = {
  name: 'search',
  description: 'Search for tracks and choose one to play from an interactive dropdown menu',
  category: 'music',
  aliases: [],
  slashData: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for tracks')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Search terms')
        .setRequired(true)
    ),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const query = ctx.getString('query', 0);
    if (!query) {
      return ctx.sendError('Missing Query', 'Please provide a search term!');
    }

    if (!ctx.voiceChannel) {
      return ctx.sendError('Voice Channel Required', 'You must be connected to a voice channel to search and play music!');
    }

    await ctx.defer();

    try {
      const searchResults = await YouTube.search(query, { limit: 10, type: 'video' });
      if (!searchResults || searchResults.length === 0) {
        return ctx.sendError('No Results', `No tracks found matching \`${query}\`.`);
      }

      const tracks = searchResults.slice(0, 10).map((t) => ({
        title: t.title || 'Unknown Title',
        url: t.url,
        durationFormatted: t.durationFormatted || '00:00',
        author: t.channel?.name || 'Artist'
      }));

      const searchSessionId = `${ctx.user.id}_${Date.now()}`;
      ctx.client.searchSessions.set(searchSessionId, {
        tracks: tracks,
        user: ctx.user,
        voiceChannel: ctx.voiceChannel,
        textChannel: ctx.channel,
        guild: ctx.guild,
        createdAt: Date.now()
      });

      setTimeout(() => {
        ctx.client.searchSessions.delete(searchSessionId);
      }, 60000);

      const payload = createSearchSelectMenu(query, tracks, searchSessionId);
      return ctx.reply(payload);
    } catch (err) {
      return ctx.sendError('Search Failed', `Error searching for tracks: \`${err.message}\``);
    }
  }
};
