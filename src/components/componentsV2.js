const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonStyle,
  MessageFlags
} = require('discord.js');
const { formatDuration } = require('../utils/timeFormat');
const { FILTERS } = require('../audio/filters');
const db = require('../database/db');
const config = require('../config');

const BRAND_FOOTER = config.bot.footer;

// Standard Quick Action Buttons
function createQuickActionRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('help_quick_play')
      .setLabel('Controls')
      .setEmoji(config.emojis.effects)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_like')
      .setLabel('Like')
      .setEmoji(config.emojis.heart)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_show_queue')
      .setLabel('Queue')
      .setEmoji(config.emojis.queue)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('component_dismiss')
      .setLabel('✕')
      .setStyle(ButtonStyle.Secondary)
  );
}

function createDismissRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('component_dismiss')
      .setLabel('✕ Dismiss')
      .setStyle(ButtonStyle.Secondary)
  );
}

// -------------------------------------------------------------
// 1. Help Container
// -------------------------------------------------------------
const HELP_CATEGORIES = {
  music: {
    label: 'Music',
    description: 'Core music playback, search, likes, and library management',
    commands: [
      { name: 'play', aliases: ['p'], desc: 'Plays a track (supports search or links)' },
      { name: 'playskip', aliases: ['ps', 'pskip', 'playnow', 'pn'], desc: 'Skips the current song and plays the song you requested' },
      { name: 'playtop', aliases: ['pt', 'ptop'], desc: 'Adds a song with the given name/url on the top of the queue' },
      { name: 'pause', aliases: [], desc: 'Pauses the current song' },
      { name: 'resume', aliases: [], desc: 'Resumes the current song' },
      { name: 'join', aliases: ['summon', 'start'], desc: 'Joins the voice channel you are in' },
      { name: 'disconnect', aliases: ['dc', 'leave', 'fuckoff', 'stop'], desc: 'Disconnects from voice channel' },
      { name: 'search', aliases: [], desc: 'Search for tracks' },
      { name: 'like', aliases: ['heart', 'love', 'grab'], desc: 'Like/unlike the current track (toggles)' },
      { name: 'liked', aliases: ['likes', 'favorites', 'favourites'], desc: 'View your liked tracks' },
      { name: 'history', aliases: ['hist', 'recent'], desc: 'View your or the server\'s listening history' }
    ]
  },
  queue: {
    label: 'Queue',
    description: 'Queue operations, pagination, reordering, and maintenance',
    commands: [
      { name: 'queue', aliases: ['q'], desc: 'View the current music queue' },
      { name: 'move', aliases: ['m'], desc: 'Move song in queue' },
      { name: 'remove', aliases: ['rm'], desc: 'Remove song from queue' },
      { name: 'clear', aliases: [], desc: 'Clears the music queue' },
      { name: 'skipto', aliases: ['st'], desc: 'Skips to a certain position in the queue' },
      { name: 'shuffle', aliases: [], desc: 'Shuffles the current music queue' },
      { name: 'removedupes', aliases: ['rmd', 'rd', 'drm'], desc: 'Removes duplicate songs from the queue' },
      { name: 'leavecleanup', aliases: ['lc'], desc: 'Removes absent user\'s songs from the queue' }
    ]
  },
  controls: {
    label: 'Controls',
    description: 'Interactive playback controller, filters, and seeking',
    commands: [
      { name: 'control', aliases: ['ct', 'c'], desc: 'Open music controls panel' },
      { name: 'nowplaying', aliases: ['np'], desc: 'Shows information about the currently playing track' },
      { name: 'voteskip', aliases: ['skip', 's', 'vs', 'next'], desc: 'Vote to skip the current track (requires 50% of users in VC to vote)' },
      { name: 'forceskip', aliases: ['fs', 'fskip'], desc: 'Force skips current track' },
      { name: 'seek', aliases: [], desc: 'Seek to a position in the current track' },
      { name: 'rewind', aliases: ['rwd'], desc: 'Rewinds by a certain amount of time in the current track' },
      { name: 'forward', aliases: ['fwd'], desc: 'Forwards by a certain amount of time in the current track' },
      { name: 'replay', aliases: [], desc: 'Resets the progress of the current song' },
      { name: 'loop', aliases: ['repeat'], desc: 'Loop the current song' },
      { name: 'queueloop', aliases: ['qloop', 'loopqueue', 'loopq'], desc: 'Loop the entire queue' },
      { name: 'volume', aliases: ['vol'], desc: 'Adjust volume' },
      { name: 'effects', aliases: [], desc: 'Control audio effects for enhanced music experience' }
    ]
  },
  utility: {
    label: 'Utility',
    description: 'Bot settings, lyrics, system info, and diagnostic tools',
    commands: [
      { name: 'settings', aliases: ['setting'], desc: 'Configure Jazzly music settings' },
      { name: 'ping', aliases: [], desc: 'Checks the bot\'s response time to Discord' },
      { name: 'help', aliases: [], desc: 'View this help menu' },
      { name: 'start', aliases: [], desc: 'Get started with Jazzly' },
      { name: 'lyrics', aliases: ['ly'], desc: 'Show lyrics for the currently playing track' },
      { name: 'info', aliases: [], desc: 'Learn about Jazzly' }
    ]
  }
};

function buildHelpComponentsV2(activeCategory = 'music') {
  const cat = HELP_CATEGORIES[activeCategory] || HELP_CATEGORIES.music;

  const buttonRow = new ActionRowBuilder();
  for (const [key, data] of Object.entries(HELP_CATEGORIES)) {
    const isActive = key === activeCategory;
    buttonRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`help_tab_${key}`)
        .setLabel(data.label)
        .setStyle(isActive ? ButtonStyle.Primary : ButtonStyle.Secondary)
    );
  }
  buttonRow.addComponents(
    new ButtonBuilder()
      .setCustomId('component_dismiss')
      .setLabel('✕')
      .setStyle(ButtonStyle.Secondary)
  );

  const commandLines = cat.commands.map((c) => {
    const aliasStr = c.aliases.length > 0 ? ` (${c.aliases.join(', ')})` : '';
    return `**/${c.name}**${aliasStr} - ${c.desc}`;
  }).join('\n');

  const container = new ContainerBuilder()
    .addActionRowComponents(buttonRow)
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(commandLines),
      new TextDisplayBuilder().setContent(`-# ${cat.description}\n${BRAND_FOOTER}`)
    );

  return {
    flags: [MessageFlags.IsComponentsV2],
    components: [container]
  };
}

// -------------------------------------------------------------
// 2. Spotify-Grade Now Playing Container
// -------------------------------------------------------------
function buildNowPlayingComponentsV2(queue, song, userId = null) {
  if (!song) {
    const emptyContainer = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# **N O W   P L A Y I N G**\n` +
          `## **Nothing is currently playing**\n` +
          `Use \`/play <song>\` to start streaming.\n\n` +
          `${BRAND_FOOTER}`
        )
      );
    return { flags: [MessageFlags.IsComponentsV2], components: [emptyContainer] };
  }

  const currentSec = Math.floor(queue?.currentTime || 0);
  const totalSec = song.duration || 0;
  const currentFormatted = formatDuration(currentSec);
  const totalFormatted = song.formattedDuration || formatDuration(totalSec);

  // Timeline Progress Bar
  const barLength = 22;
  const progressRatio = totalSec > 0 ? Math.min(Math.max(currentSec / totalSec, 0), 1) : 0;
  const progressIndex = Math.round(progressRatio * barLength);
  const filledBar = '━'.repeat(Math.max(0, progressIndex));
  const emptyBar = '─'.repeat(Math.max(0, barLength - progressIndex));
  const renderedBar = `${filledBar}🔘${emptyBar}`;

  // DSP & Audio Specs
  const activeFilters = queue?.filters?.names || [];
  const activeDspLabel = activeFilters.length > 0
    ? activeFilters.map((f) => f.toUpperCase()).join(' + ')
    : 'OFF';
  const hasActiveDsp = activeFilters.length > 0;

  const artistName = song.uploader?.name || 'Artist';
  const requesterName = song.member?.displayName || song.user?.username || 'Member';

  const isPaused = queue?.paused || false;
  const isLiked = userId ? db.isLiked(userId, song.url) : false;

  // 5-Button Spotify Controller Row
  const controllerRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('music_effects_panel')
      .setLabel('DSP')
      .setEmoji(config.emojis.effects)
      .setStyle(hasActiveDsp ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_replay')
      .setEmoji(config.emojis.replay)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_pause_resume')
      .setEmoji(isPaused ? config.emojis.play : config.emojis.pause)
      .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('music_skip')
      .setEmoji(config.emojis.skip)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_like')
      .setEmoji(config.emojis.heart)
      .setStyle(isLiked ? ButtonStyle.Danger : ButtonStyle.Secondary)
  );

  const container = new ContainerBuilder();
  const textContent =
    `-# **N O W   P L A Y I N G**\n` +
    `## **[${song.name}](${song.url})**\n` +
    `${artistName} • Requested by **${requesterName}**\n` +
    `\`DSP: ${activeDspLabel}\`    Bitrate: \`320kbps\`    \`4K FLAC\``;

  const thumbnailUrl = song.thumbnail || 'https://i.ytimg.com/vi/60ItHLz5WEA/hqdefault.jpg';
  if (thumbnailUrl && thumbnailUrl.startsWith('http')) {
    const section = new SectionBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(textContent))
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(thumbnailUrl));
    container.addSectionComponents(section);
  } else {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(textContent));
  }

  container
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `\`${currentFormatted}\` ${renderedBar} \`${totalFormatted}\`\n` +
        `${BRAND_FOOTER}`
      )
    )
    .addActionRowComponents(controllerRow);

  return {
    flags: [MessageFlags.IsComponentsV2],
    components: [container]
  };
}

// -------------------------------------------------------------
// 3. Spotify-Grade Track Enqueued Container
// -------------------------------------------------------------
function buildTrackEnqueuedContainer(song, position = 1, queue = null) {
  const artistName = song.uploader?.name || 'Artist';
  const requesterName = song.member?.displayName || song.user?.username || 'Member';
  const durationStr = song.formattedDuration || formatDuration(song.duration || 0);

  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('help_quick_play')
      .setLabel('Controls')
      .setEmoji(config.emojis.effects)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_like')
      .setLabel('Like')
      .setEmoji(config.emojis.heart)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_show_queue')
      .setLabel('Queue')
      .setEmoji(config.emojis.queue)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('component_dismiss')
      .setLabel('✕')
      .setStyle(ButtonStyle.Secondary)
  );

  const container = new ContainerBuilder();
  const textContent =
    `-# **T R A C K   E N Q U E U E D**\n` +
    `## **[${song.name}](${song.url})**\n` +
    `${artistName} • Position in Queue: **#${position}**\n` +
    `\`Duration: ${durationStr}\`    \`Bitrate: 320kbps\`    \`High Quality\``;

  const thumbnailUrl = song.thumbnail || 'https://i.ytimg.com/vi/60ItHLz5WEA/hqdefault.jpg';
  if (thumbnailUrl && thumbnailUrl.startsWith('http')) {
    const section = new SectionBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(textContent))
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(thumbnailUrl));
    container.addSectionComponents(section);
  } else {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(textContent));
  }

  container
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(BRAND_FOOTER)
    )
    .addActionRowComponents(actionRow);

  return {
    flags: [MessageFlags.IsComponentsV2],
    components: [container]
  };
}

// -------------------------------------------------------------
// 4. Spotify-Grade Playlist Enqueued Container
// -------------------------------------------------------------
function buildPlaylistEnqueuedContainer(playlist, requester) {
  const requesterName = requester?.displayName || requester?.username || 'Member';
  const songCount = playlist.songs?.length || 0;
  const totalDuration = playlist.formattedDuration || '00:00';

  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('queue_shuffle')
      .setLabel('Shuffle')
      .setEmoji(config.emojis.shuffle)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('music_show_queue')
      .setLabel('Queue')
      .setEmoji(config.emojis.queue)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('component_dismiss')
      .setLabel('✕')
      .setStyle(ButtonStyle.Secondary)
  );

  const container = new ContainerBuilder();
  const textContent =
    `-# **P L A Y L I S T   E N Q U E U E D**\n` +
    `## **[${playlist.name}](${playlist.url || 'https://spotify.com'})**\n` +
    `**${songCount} Tracks** enqueued by **${requesterName}**\n` +
    `\`Total Time: ${totalDuration}\`    \`Lossless Engine\`    \`Spotify Sync\``;

  const thumbnailUrl = playlist.thumbnail || 'https://i.ytimg.com/vi/60ItHLz5WEA/hqdefault.jpg';
  if (thumbnailUrl && thumbnailUrl.startsWith('http')) {
    const section = new SectionBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(textContent))
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(thumbnailUrl));
    container.addSectionComponents(section);
  } else {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(textContent));
  }

  container
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(BRAND_FOOTER)
    )
    .addActionRowComponents(actionRow);

  return {
    flags: [MessageFlags.IsComponentsV2],
    components: [container]
  };
}

// -------------------------------------------------------------
// 5. Spotify-Grade Queue Container
// -------------------------------------------------------------
function buildQueueContainer(queue, guild, page = 1, pageSize = 10) {
  const upcomingSongs = queue?.songs?.slice(1) || [];
  const totalTracks = upcomingSongs.length;
  const totalPages = Math.max(1, Math.ceil(totalTracks / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const pageTracks = upcomingSongs.slice(startIndex, startIndex + pageSize);

  const current = queue?.songs?.[0];
  let currentPlayingText = '*Nothing playing.*';
  let headerThumbnail = null;

  if (current) {
    const cur = Math.floor(queue.currentTime || 0);
    const reqName = current.member?.displayName || current.user?.username || 'Member';
    currentPlayingText = `**[${current.name}](${current.url})** \`[${formatDuration(cur)}/${current.formattedDuration}]\` (**${reqName}**)`;
    headerThumbnail = current.thumbnail;
  }

  let queueListText = '*No upcoming tracks in queue.*';
  if (pageTracks.length > 0) {
    queueListText = pageTracks.map((t, i) => {
      const reqName = t.member?.displayName || t.user?.username || 'Member';
      return `\`${startIndex + i + 1}.\` **[${t.name}](${t.url})** \`[${t.formattedDuration}]\` • **${reqName}**`;
    }).join('\n');
  }

  const loopLabel = queue?.repeatMode === 1 ? '🔂 Song' : queue?.repeatMode === 2 ? '🔁 Queue' : 'OFF';

  const container = new ContainerBuilder();
  const textContent =
    `-# **M U S I C   Q U E U E**\n` +
    `## **${guild.name} • ${totalTracks + (current ? 1 : 0)} Tracks**\n` +
    `Now Playing: ${currentPlayingText}\n` +
    `\`Loop: ${loopLabel}\`    \`Volume: ${queue?.volume || 80}%\`    \`Total: ${queue?.formattedDuration || '00:00'}\``;

  if (headerThumbnail && headerThumbnail.startsWith('http')) {
    const section = new SectionBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(textContent))
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(headerThumbnail));
    container.addSectionComponents(section);
  } else {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(textContent));
  }

  container
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Upcoming Tracks**\n` +
        `${queueListText}\n\n` +
        `-# Page **${currentPage}** of **${totalPages}** • Total Queue: \`${queue?.formattedDuration || '00:00'}\`\n` +
        `${BRAND_FOOTER}`
      )
    );

  if (totalTracks > 0) {
    const isFirst = currentPage === 1;
    const isLast = currentPage === totalPages;

    const navRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('queue_page_first').setEmoji('⏮️').setStyle(ButtonStyle.Secondary).setDisabled(isFirst),
      new ButtonBuilder().setCustomId(`queue_page_prev_${currentPage - 1}`).setEmoji('◀️').setStyle(ButtonStyle.Secondary).setDisabled(isFirst),
      new ButtonBuilder().setCustomId('queue_shuffle').setEmoji(config.emojis.shuffle).setLabel('Shuffle').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`queue_page_next_${currentPage + 1}`).setEmoji('▶️').setStyle(ButtonStyle.Secondary).setDisabled(isLast),
      new ButtonBuilder().setCustomId('queue_page_last').setEmoji('⏭️').setStyle(ButtonStyle.Secondary).setDisabled(isLast)
    );

    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('queue_clear').setLabel('Clear Queue').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('component_dismiss').setLabel('✕ Close').setStyle(ButtonStyle.Secondary)
    );

    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1));
    container.addActionRowComponents(navRow, actionRow);
  }

  return {
    flags: [MessageFlags.IsComponentsV2],
    components: [container]
  };
}

// -------------------------------------------------------------
// 6. Spotify-Grade Audio Effects Container
// -------------------------------------------------------------
function buildEffectsContainer(queue) {
  const activeFilters = queue?.filters?.names || [];
  const activeText = activeFilters.length > 0
    ? activeFilters.map((k) => `• **${FILTERS[k]?.name || k}** (${FILTERS[k]?.description || ''})`).join('\n')
    : '*No audio effects currently applied.*';

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_effect')
    .setPlaceholder('🎚️ Choose an audio filter preset to toggle...')
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

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('effect_bassboost').setLabel('Bass Boost').setEmoji('🔉').setStyle(activeFilters.includes('bassboost') ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('effect_nightcore').setLabel('Nightcore').setEmoji('🐿️').setStyle(activeFilters.includes('nightcore') ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('effect_8d').setLabel('8D Audio').setEmoji('🎧').setStyle(activeFilters.includes('8d') ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('effect_vaporwave').setLabel('Vaporwave').setEmoji('🌸').setStyle(activeFilters.includes('vaporwave') ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('effect_clear_all').setLabel('Clear All').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
  );

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# **D S P   &   E Q U A L I Z E R**\n` +
        `## **Sound Processing Engine**\n` +
        `Real-time 32-bit floating point audio equalizer and DSP filters.\n` +
        `\`DSP: ${activeFilters.length > 0 ? activeFilters.join(' + ').toUpperCase() : 'OFF / FLAT'}\`    \`32-bit Float\`    \`Lossless Fidelity\``
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Active Equalizer Presets**\n` +
        `${activeText}\n\n` +
        `-# Toggle presets below or choose from the dropdown menu:\n` +
        `${BRAND_FOOTER}`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
    .addActionRowComponents(selectRow, buttonRow);

  return {
    flags: [MessageFlags.IsComponentsV2],
    components: [container]
  };
}

// -------------------------------------------------------------
// 7. Spotify-Grade Success & Error Message Containers
// -------------------------------------------------------------
function buildSuccessContainer(title, description, customActionRows = null) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# **A C T I O N   C O N F I R M E D**\n` +
        `## **✅ ${title}**\n` +
        `${description}\n\n` +
        `${BRAND_FOOTER}`
      )
    );

  const rows = customActionRows || [createQuickActionRow()];
  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1));
  container.addActionRowComponents(...rows);

  return {
    flags: [MessageFlags.IsComponentsV2],
    components: [container]
  };
}

function buildErrorContainer(title, description) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# **E R R O R   N O T I C I N G**\n` +
        `## **❌ ${title}**\n` +
        `${description}\n\n` +
        `${BRAND_FOOTER}`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
    .addActionRowComponents(createDismissRow());

  return {
    flags: [MessageFlags.IsComponentsV2],
    components: [container]
  };
}

module.exports = {
  createQuickActionRow,
  createDismissRow,
  buildHelpComponentsV2,
  buildNowPlayingComponentsV2,
  buildTrackEnqueuedContainer,
  buildPlaylistEnqueuedContainer,
  buildSuccessContainer,
  buildErrorContainer,
  buildQueueContainer,
  buildEffectsContainer,
  createComponentsV2Row: createQuickActionRow
};
