const mongoose = require('mongoose');

const likedTrackSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String, required: true },
  duration: { type: Number, default: 0 },
  durationFormatted: { type: String, default: '00:00' },
  thumbnail: { type: String, default: '' },
  author: { type: String, default: 'Unknown Artist' },
  addedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    username: { type: String, default: 'User' },
    likedTracks: [likedTrackSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
