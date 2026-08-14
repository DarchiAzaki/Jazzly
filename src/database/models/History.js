const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    duration: { type: Number, default: 0 },
    durationFormatted: { type: String, default: '00:00' },
    thumbnail: { type: String, default: '' },
    author: { type: String, default: 'Unknown Artist' },
    playedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.models.History || mongoose.model('History', historySchema);
