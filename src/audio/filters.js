/**
 * Audio filters definitions for DisTube FFmpeg pipeline
 */
const FILTERS = {
  bassboost: {
    name: 'Bass Boost',
    description: 'Punchy bass enhancement (+10dB)',
    emoji: '🔉',
    value: 'bass=g=10,dynaudnorm=f=200'
  },
  nightcore: {
    name: 'Nightcore',
    description: 'High pitch and fast tempo (1.25x speed, 1.25x pitch)',
    emoji: '🐿️',
    value: 'asetrate=48000*1.25,aresample=48000,atempo=1.0'
  },
  vaporwave: {
    name: 'Vaporwave / Slowed',
    description: 'Slowed aesthetic tempo with warm low-pass (0.85x)',
    emoji: '🌸',
    value: 'asetrate=48000*0.85,aresample=48000,lowpass=f=3500'
  },
  '8d': {
    name: '8D Audio',
    description: 'Immersive circular panning audio effect',
    emoji: '🎧',
    value: 'apulsator=hz=0.125:amount=1'
  },
  karaoke: {
    name: 'Karaoke',
    description: 'Attenuates center-panned vocal frequencies',
    emoji: '🎤',
    value: 'stereotools=mlev=0.03'
  },
  echo: {
    name: 'Echo / Reverb',
    description: 'Spacious echo chamber effect',
    emoji: '🏰',
    value: 'aecho=0.8:0.9:1000:0.3'
  },
  treble: {
    name: 'Treble Boost',
    description: 'Crisp and clear high frequencies',
    emoji: '✨',
    value: 'treble=g=8:f=4000:w=0.5'
  },
  flanger: {
    name: 'Flanger',
    description: 'Sweeping jet-engine modulation',
    emoji: '🌀',
    value: 'flanger=delay=10:depth=2'
  },
  tremolo: {
    name: 'Tremolo',
    description: 'Rapid volume modulation',
    emoji: '〰️',
    value: 'tremolo=f=5:d=0.7'
  }
};

/**
 * Get map of custom filter strings for DisTube options
 */
function getCustomFilters() {
  const custom = {};
  for (const [key, filter] of Object.entries(FILTERS)) {
    custom[key] = filter.value;
  }
  return custom;
}

module.exports = {
  FILTERS,
  getCustomFilters
};
