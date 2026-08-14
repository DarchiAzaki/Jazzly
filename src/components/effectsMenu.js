const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const { FILTERS } = require('../audio/filters');
const config = require('../config');

/**
 * Creates embed and components for audio effects manager
 * @param {import('distube').Queue} queue
 * @returns {{embed: EmbedBuilder, components: ActionRowBuilder[]}}
 */
function createEffectsMenu(queue) {
  const activeFilters = queue?.filters?.names || [];

  const activeText = activeFilters.length > 0
    ? activeFilters.map((k) => `• **${FILTERS[k]?.name || k}** (${FILTERS[k]?.description || ''})`).join('\n')
    : '*No audio effects currently applied.*';

  const embed = new EmbedBuilder()
    .setColor(config.bot.colorSecondary)
    .setTitle('🎛️ Audio Effects & Equalizer')
    .setDescription(
      `Customize your listening experience with high-quality FFmpeg audio filters.\n\n` +
      `__**Currently Active Filters:**__\n${activeText}\n\n` +
      `Select a filter from the dropdown below to toggle it on or off.`
    )
    .setFooter({ text: `${config.bot.name} • Changes apply in real-time` })
    .setTimestamp();

  // Create Select Menu Options
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_effect')
    .setPlaceholder('🎚️ Choose an audio filter to toggle...')
    .setMinValues(1)
    .setMaxValues(1);

  for (const [key, filter] of Object.entries(FILTERS)) {
    const isApplied = activeFilters.includes(key);
    selectMenu.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(`${filter.name} ${isApplied ? '✅ [Active]' : ''}`)
        .setDescription(filter.description.substring(0, 100))
        .setValue(key)
        .setEmoji(filter.emoji)
    );
  }

  const selectRow = new ActionRowBuilder().addComponents(selectMenu);

  // Quick action buttons
  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('effect_bassboost')
      .setLabel('Bass Boost')
      .setEmoji('🔉')
      .setStyle(activeFilters.includes('bassboost') ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('effect_nightcore')
      .setLabel('Nightcore')
      .setEmoji('🐿️')
      .setStyle(activeFilters.includes('nightcore') ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('effect_8d')
      .setLabel('8D Audio')
      .setEmoji('🎧')
      .setStyle(activeFilters.includes('8d') ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('effect_vaporwave')
      .setLabel('Vaporwave')
      .setEmoji('🌸')
      .setStyle(activeFilters.includes('vaporwave') ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('effect_clear_all')
      .setLabel('Clear All')
      .setEmoji('🗑️')
      .setStyle(ButtonStyle.Danger)
  );

  return { embed, components: [selectRow, buttonRow] };
}

module.exports = {
  createEffectsMenu
};
