const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  name: 'like',
  description: 'Like or unlike the currently playing track (toggles favorite)',
  category: 'user',
  aliases: ['heart', 'love', 'grab'],
  slashData: new SlashCommandBuilder()
    .setName('like')
    .setDescription('Like/unlike the current track (toggles)'),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (!queue || !queue.songs[0]) {
      return ctx.sendError('Nothing Playing', 'There is no music currently playing to like.');
    }

    const current = queue.songs[0];
    const { liked, count } = db.toggleLike(ctx.user.id, {
      url: current.url,
      title: current.name,
      duration: current.duration || 0,
      durationFormatted: current.formattedDuration || '00:00',
      thumbnail: current.thumbnail,
      author: current.uploader?.name || 'Artist'
    });

    if (liked) {
      return ctx.sendSuccess(
        '❤️ Added to Favorites',
        `Saved **[${current.name}](${current.url})** to your liked songs!\nYou now have **${count}** favorite tracks. View them anytime with \`/liked\`.`
      );
    } else {
      return ctx.sendSuccess(
        '💔 Removed from Favorites',
        `Removed **[${current.name}](${current.url})** from your liked tracks.`
      );
    }
  }
};
