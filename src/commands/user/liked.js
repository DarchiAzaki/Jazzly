const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');
const { createLikedPagination } = require('../../components/likedPagination');

module.exports = {
  name: 'liked',
  description: 'View and manage your liked tracks or play them all',
  category: 'user',
  aliases: ['likes', 'favorites', 'favourites'],
  slashData: new SlashCommandBuilder()
    .setName('liked')
    .setDescription('View your liked tracks')
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
    const likedTracks = db.getLikedSongs(ctx.user.id);
    const page = ctx.getInteger('page', 0, 1) || 1;

    const payload = createLikedPagination(ctx.user, likedTracks, page, 10);
    return ctx.reply(payload);
  }
};
