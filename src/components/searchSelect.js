const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require('discord.js');
const config = require('../config');

const BRAND_FOOTER = config.bot.footer;

/**
 * Creates search results Components V2 container and select menu
 * @param {string} query
 * @param {Array<{title: string, url: string, durationFormatted: string, author: string}>} tracks
 * @param {string} searchSessionId
 */
function createSearchSelectMenu(query, tracks, searchSessionId) {
  const trackLines = tracks
    .map((t, i) => `\`${i + 1}.\` **[${t.title}](${t.url})**\n⏱️ \`${t.durationFormatted}\` • 👤 \`${t.author}\``)
    .join('\n\n');

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`search_select_${searchSessionId}`)
    .setPlaceholder('🎵 Choose a track to play...')
    .setMinValues(1)
    .setMaxValues(1);

  tracks.forEach((track, index) => {
    const label = `${index + 1}. ${track.title}`.substring(0, 100);
    const desc = `${track.author} • ${track.durationFormatted}`.substring(0, 100);

    selectMenu.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(label)
        .setDescription(desc)
        .setValue(index.toString())
        .setEmoji('🎵')
    );
  });

  const selectRow = new ActionRowBuilder().addComponents(selectMenu);
  const cancelRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`search_cancel_${searchSessionId}`)
      .setLabel('Cancel')
      .setEmoji('✕')
      .setStyle(ButtonStyle.Secondary)
  );

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# **S E A R C H   R E S U L T S**\n` +
        `## **Results for "${query}"**\n` +
        `Select a track from the dropdown below to begin playback.\n` +
        `\`10 Results\`    \`Auto-Match\`    \`Expires in 60s\``
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Top Results**\n` +
        `${trackLines}\n\n` +
        `${BRAND_FOOTER}`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
    .addActionRowComponents(selectRow, cancelRow);

  return {
    flags: [MessageFlags.IsComponentsV2],
    components: [container]
  };
}

module.exports = {
  createSearchSelectMenu
};
