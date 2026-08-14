const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, unique: true, index: true },
    prefix: { type: String, default: '!' },
    defaultVolume: { type: Number, default: 80, min: 1, max: 200 },
    voteSkipPercent: { type: Number, default: 50, min: 1, max: 100 },
    stayInVC24_7: { type: Boolean, default: false },
    announceNowPlaying: { type: Boolean, default: true },
    djRoleId: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Guild || mongoose.model('Guild', guildSchema);
