const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require('discord.js');
const config = require('../config');

const BRAND_FOOTER = config.bot.footer;

/**
 * Creates Spotify-grade Liked tracks Components V2 container
 * @param {import('discord.js').User} user
 * @param {Array} likedTracks
 * @param {number} page
 * @param {number} pageSize
 */
function createLikedPagination(user, likedTracks = [], page = 1, pageSize = 10) {
  const total = likedTracks.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const pageTracks = likedTracks.slice(startIndex, startIndex + pageSize);

  let listText = '';
  if (pageTracks.length === 0) {
    listText = '*You have not liked any tracks yet! Click ❤️ while listening to add songs to your favorites library.*';
  } else {
    listText = pageTracks
      .map((t, i) => `\`${startIndex + i + 1}.\` **[${t.title}](${t.url})**\n⏱️ \`${t.durationFormatted || '00:00'}\` • 👤 \`${t.author || 'Artist'}\``)
      .join('\n\n');
  }

  const container = new ContainerBuilder();
  const textContent =
    `-# **Y O U R   L I B R A R Y**\n` +
    `## **${user.username}'s Liked Tracks ❤️**\n` +
    `**${total} Favorites** saved in your personal vault\n` +
    `\`Personal Vault\`    \`Cloud Sync\`    \`Lossless Quality\``;

  const avatarUrl = typeof user.displayAvatarURL === 'function' ? user.displayAvatarURL() : null;
  if (avatarUrl && avatarUrl.startsWith('http')) {
    const section = new SectionBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(textContent))
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarUrl));
    container.addSectionComponents(section);
  } else {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(textContent));
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`liked_prev_${user.id}_${currentPage - 1}`)
      .setLabel('Prev')
      .setEmoji('◀️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage <= 1),
    new ButtonBuilder()
      .setCustomId(`liked_play_all_${user.id}`)
      .setLabel('Play All')
      .setEmoji('❤️')
      .setStyle(ButtonStyle.Success)
      .setDisabled(total === 0),
    new ButtonBuilder()
      .setCustomId(`liked_next_${user.id}_${currentPage + 1}`)
      .setLabel('Next')
      .setEmoji('▶️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage >= totalPages),
    new ButtonBuilder()
      .setCustomId('component_dismiss')
      .setLabel('✕')
      .setStyle(ButtonStyle.Secondary)
  );

  container
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Favorite Tracks**\n` +
        `${listText}\n\n` +
        `-# Page **${currentPage}** of **${totalPages}** • Total: **${total}** track(s)\n` +
        `${BRAND_FOOTER}`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
    .addActionRowComponents(row);

  return {
    flags: [MessageFlags.IsComponentsV2],
    components: [container]
  };
}

module.exports = {
  createLikedPagination
};
