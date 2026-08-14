# 🎵 Jazzly

> High-fidelity, standalone Discord Music Bot by [Hall of Malevolence](<https://hallofmalevolence.org/jazzly>).

---

## ⚡ Overview

Jazzly is a self-contained Discord audio bot built on Node.js and **DisTube v5** with integrated **yt-dlp**, Spotify, and SoundCloud extractors. It delivers lossless playback, real-time equalizer effects, and interactive music controls without requiring external Lavalink servers or Java runtimes.

### ✨ Features
- **Standalone Audio Engine**: Runs locally in Node.js via DisTube v5 and custom yt-dlp stream pipeline.
- **Multi-Source Playback**: Full support for YouTube, Spotify (tracks, albums, playlists), SoundCloud, and direct URLs.
- **Real-Time DSP Equalizer**: Live audio filters including Bass Boost, Nightcore, 8D Audio, Vaporwave, Treble Boost, and Flanger.
- **Interactive Controls**: Dynamic playback controller with timeline progress bar, queue pagination, and search menus.
- **Favorites & Playlists**: Personal liked tracks vault with 1-click library playback.
- **Queue Management**: Volume controls, vote skip (50% threshold), track reordering, duplicate cleaner, and absent listener cleanup.
- **Persistent Storage**: MongoDB database with local memory cache for server settings, favorites, and playback history.

---

## 📋 Commands

### 🎵 Playback & Controls
| Command | Aliases | Description |
| :--- | :--- | :--- |
| `/play` | `!p` | Plays a track or playlist from YouTube, Spotify, SoundCloud, or search keywords |
| `/playskip` | `!ps`, `!pskip`, `!pn` | Skips the current track and immediately starts requested song |
| `/playtop` | `!pt`, `!ptop` | Adds requested track directly to the front of the upcoming queue |
| `/pause` | `!pause` | Pauses audio playback |
| `/resume` | `!resume` | Resumes paused audio playback |
| `/join` | `!summon`, `!start` | Connects the bot to your current voice channel |
| `/disconnect` | `!dc`, `!leave`, `!stop` | Leaves voice channel and resets the queue |
| `/search` | `!search` | Interactive search dropdown showing top 10 results |
| `/nowplaying` | `!np` | Displays current track card with progress bar and controller buttons |
| `/control` | `!ct`, `!c` | Opens the interactive controller panel |
| `/voteskip` | `!skip`, `!s`, `!next` | Starts a vote skip (requires 50% listener agreement) |
| `/forceskip` | `!fs`, `!fskip` | Immediately force-skips the current track |
| `/seek` | `!seek` | Seeks to a specific timestamp in the track (e.g. `1:30`, `90s`) |
| `/rewind` | `!rwd` | Rewinds playback by a given amount of time |
| `/forward` | `!fwd` | Fast-forwards playback by a given amount of time |
| `/replay` | `!replay` | Restarts the current track from 0:00 |
| `/loop` | `!repeat` | Toggles track loop mode |
| `/queueloop` | `!qloop`, `!loopqueue` | Toggles loop mode for the entire queue |
| `/volume` | `!vol` | Adjusts playback volume (1% - 200%) |
| `/effects` | `!effects` | Opens real-time audio equalizer & effects panel |
| `/lyrics` | `!ly` | Fetches live synced lyrics for active or searched track |

### 📜 Queue Management
| Command | Aliases | Description |
| :--- | :--- | :--- |
| `/queue` | `!q` | Displays current music queue with interactive pagination |
| `/move` | `!m` | Moves a track from position A to position B |
| `/remove` | `!rm` | Removes a specific track from the queue |
| `/clear` | `!clear` | Clears all upcoming tracks from the queue |
| `/skipto` | `!st` | Skips directly to a given position in the queue |
| `/shuffle` | `!shuffle` | Randomizes the upcoming track order |
| `/removedupes` | `!rmd`, `!rd` | Removes duplicate tracks from the queue |
| `/leavecleanup` | `!lc` | Cleans up songs queued by users who left the voice channel |

### ❤️ Library & User
| Command | Aliases | Description |
| :--- | :--- | :--- |
| `/like` | `!heart`, `!love` | Adds or removes the current track from your personal library |
| `/liked` | `!likes`, `!favorites` | Displays saved favorite tracks with 1-click **Play All** |
| `/history` | `!hist`, `!recent` | Displays recent listening history for user or server |

### ⚙️ Settings & System
| Command | Aliases | Description |
| :--- | :--- | :--- |
| `/settings` | `!settings` | Configures prefix, default volume, 24/7 mode, and announcements |
| `/ping` | `!ping` | Displays WebSocket latency and system telemetry |
| `/help` | `!help` | Opens interactive command center |
| `/start` | `!start` | Onboarding guide for new servers |
| `/info` | `!info` | Displays system architecture, uptime, and runtime telemetry |

---

## 🚀 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- Discord Bot Token from [Discord Developer Portal](https://discord.com/developers/applications)
- MongoDB Database (Optional: falls back to local JSON caching if not provided)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/DarchiAzaki/Jazzly.git
cd Jazzly
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_client_id_here
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jazzly?retryWrites=true&w=majority
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
DEFAULT_PREFIX=!
DEFAULT_VOLUME=80
VOTE_SKIP_PERCENT=50
STAY_IN_VC_24_7=false
LEAVE_ON_EMPTY_TIMEOUT_SECONDS=60
ANNOUNCE_NOW_PLAYING=true
```

### 3. Register Slash Commands
```bash
npm run deploy
```

### 4. Start the Application
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

---

## 📂 Project Structure

```
Jazzly/
├── data/                       # Local cache fallback
├── src/
│   ├── index.js                # Application entry point & graceful shutdown
│   ├── client.js               # Extended Discord.js client instance
│   ├── config.js               # Configuration and brand settings
│   ├── audio/
│   │   ├── DisTubeManager.js   # DisTube v5 pipeline & playback event listeners
│   │   ├── filters.js          # FFmpeg DSP equalizer filters
│   │   └── plugins/            # Robust custom yt-dlp stream extractor
│   ├── commands/               # 37 Slash and Prefix command modules
│   │   ├── general/
│   │   ├── music/
│   │   ├── queue/
│   │   └── user/
│   ├── components/             # UI builders, controllers, and menus
│   ├── database/               # Mongoose schemas & sync store
│   ├── events/                 # Discord gateway event handlers
│   ├── handlers/               # Command, event, and component routers
│   └── utils/                  # Context helpers, duration formatters, lyrics fetcher
```

---

## 📄 License
MIT License • Developed by [Hall of Malevolence](<https://hallofmalevolence.org/jazzly>).
