module.exports = {
  name: 'voiceStateUpdate',
  once: false,
  /**
   * @param {import('../client')} client
   * @param {import('discord.js').VoiceState} oldState
   * @param {import('discord.js').VoiceState} newState
   */
  async execute(client, oldState, newState) {
    const guildId = oldState.guild.id || newState.guild.id;
    const queue = client.distube.getQueue(guildId);
    if (!queue || !queue.voiceChannel) return;

    const channel = client.channels.cache.get(queue.voiceChannel.id);
    if (!channel || channel.type !== 2) return; // 2 = GuildVoice

    // Count human listeners in VC
    const humanListeners = channel.members.filter((m) => !m.user.bot);
    if (humanListeners.size === 0) {
      if (!queue.data) queue.data = {};
      if (!queue.data.disconnectTimeout) {
        const timeout = setTimeout(() => {
          if (channel.members.filter((m) => !m.user.bot).size === 0) {
            queue.stop();
          }
        }, 60000);
        queue.data.disconnectTimeout = timeout;
      }
    } else {
      if (queue.data?.disconnectTimeout) {
        clearTimeout(queue.data.disconnectTimeout);
        delete queue.data.disconnectTimeout;
      }
    }
  }
};
