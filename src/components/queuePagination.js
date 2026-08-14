const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Creates pagination buttons for queue view
 * @param {number} currentPage
 * @param {number} totalPages
 * @returns {ActionRowBuilder[]}
 */
function createQueuePaginationRow(currentPage, totalPages) {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`queue_page_first`)
      .setLabel('First')
      .setEmoji('⏮️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage <= 1),
    new ButtonBuilder()
      .setCustomId(`queue_page_prev_${currentPage - 1}`)
      .setLabel('Prev')
      .setEmoji('◀️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage <= 1),
    new ButtonBuilder()
      .setCustomId(`queue_page_info`)
      .setLabel(`${currentPage} / ${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`queue_page_next_${currentPage + 1}`)
      .setLabel('Next')
      .setEmoji('▶️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage >= totalPages),
    new ButtonBuilder()
      .setCustomId(`queue_page_last_${totalPages}`)
      .setLabel('Last')
      .setEmoji('⏭️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage >= totalPages)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('queue_shuffle')
      .setLabel('Shuffle')
      .setEmoji('🔀')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('queue_clear')
      .setLabel('Clear')
      .setEmoji('🗑️')
      .setStyle(ButtonStyle.Danger)
  );

  return [row1, row2];
}

module.exports = {
  createQueuePaginationRow
};
