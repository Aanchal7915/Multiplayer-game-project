# ⚡ MindBlitz — Real-Time Multiplayer Trivia Arena

[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Mobile%20%7C%20Desktop-cyan.svg)](https://developer.mozilla.org/en-US/docs/Web)
[![Runtime](https://img.shields.io/badge/Runtime-Node.js%20v20%2B-green.svg)](https://nodejs.org/)
[![Architecture](https://img.shields.io/badge/Architecture-Dual--Engine%20(Local%20%2B%20Serverless)-indigo.svg)](https://www.netlify.com/)
[![Audio](https://img.shields.io/badge/Audio-Web%20Audio%20API-amber.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Dependencies](https://img.shields.io/badge/Dependencies-Zero%20External%20Frontend%20Libs-emerald.svg)](https://github.com)

**MindBlitz** is a high-octane, real-time multiplayer trivia battle game engineered for 2–8 concurrent competitors. Featuring 7-character high-entropy room codes, live synchronized lobby states, procedural sound synthesis, randomized general knowledge question pools, and speed-bonus scoring mechanics.

---

## 🌟 Key Highlights & Engineering Features

### 1. 🎯 Dynamic Question Pool & Shuffling Engine
- Built-in library of **21+ curated general knowledge questions** spanning astronomy, physics, world history, geography, computer science, and natural wonders.
- Uses an in-memory **Fisher-Yates random sampling algorithm** on room generation to select 3 non-repeating questions per battle, ensuring a completely fresh gameplay experience across rematches.

### 2. ⚡ Speed-Bonus Scoring Engine
- **Base Reward**: `+100 points` awarded for every correct response.
- **Lightning Reflex Bonus**: `+50 extra points` (150 total) awarded exclusively to the *first* player in the arena who submits the correct option.
- **Instant Client Lock-in**: Once a user taps an option, the submission immediately locks on both client and server to prevent multiple entries.

### 3. 🔊 Procedural Web Audio API Sound System
- 100% code-synthesized audio effects generated via the browser's native `AudioContext` (no external MP3/WAV assets to load or buffer).
- Includes custom soundwaves:
  - Button clicks & lock-in chimes
  - Round countdown ticker
  - Success arpeggio & error buzzers
  - Grand winner fanfare
- User-controlled global audio toggle (`SFX ON / OFF`) seamlessly persisted in memory.

### 4. 🎊 High-Performance Canvas Confetti Physics
- Custom HTML5 `<canvas>` particle physics engine that triggers upon match completion.
- Simulates multi-colored ribbon particles with gravity, air resistance, and 3D rotational physics for an immersive victory ceremony.

### 5. 🛡️ 7-Character Room Protocol
- Upgraded room code generation using a 7-character alphanumeric keyspace (e.g., `BLTZ789`, `A8K2M9P`).
- Millions of unique room combinations prevent collision and unauthorized room sniffing during concurrent sessions.

### 6. 📱 Responsive Midnight-Obsidian UI
- Custom design system utilizing CSS Custom Properties (Design Tokens):
  - Primary Background: Midnight Obsidian (`#090d16` / `#0f172a`)
  - Accent Tones: Electric Cyan (`#06b6d4`), Radiant Indigo (`#6366f1`), Sunset Amber (`#f59e0b`), Emerald (`#10b981`)
- Handcrafted vector SVGs for all badges, trophy icons, countdown meters, and podium medals.
- 100% fluid mobile layout with touch-optimized hit targets (`min-height: 48px`).

---

## 🏗️ System Architecture & Workflow

MindBlitz supports a **Dual-Engine Architecture**:
1. **Local High-Performance Server**: Pure Node.js utilizing `node:http`, `node:crypto`, and `node:fs/promises` running on port `3001` with zero external dependencies.
2. **Serverless Cloud Deployment**: Compatible with Netlify Functions (`netlify/functions/game.mjs`) backed by `@netlify/blobs` state storage.

```
       [ Competitor A (Phone) ]          [ Competitor B (Laptop) ]
                  \                                  /
                   \                                /
                    ▼                              ▼
             [ HTTP Long-Polling (800ms State Synchronization) ]
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │                   MINDBLITZ BACKEND                    │
       │                                                        │
       │  • Room Code Generator (7-Char High-Entropy Alphanumeric)│
       │  • Dynamic Question Selector (Fisher-Yates Shuffle)    │
       │  • Concurrent Answer Lock-in & Timestamp Resolver      │
       │  • Speed Bonus & Cumulative Leaderboard Calculator     │
       └────────────────────────────────────────────────────────┘
```

### Game State Lifecycle

```
[ HOME SCREEN ]
       │
       ├──► Host creates room (7-char code generated, 3 questions picked)
       └──► Players join via code & nickname
                 │
                 ▼
          [ LOBBY SCREEN ] ◄── (Synchronized player cards)
                 │
                 ▼ (Host triggers "Launch Battle")
       [ QUESTION ROUND (1 of 3) ]
                 │
                 ├── Timer & question rendered
                 ├── Player locks answer (Audio feedback)
                 └── All players answered OR timer expires
                             │
                             ▼
                    [ REVEAL SCREEN ]
                             │
                             ├── Correct answer highlighted
                             ├── Speed bonus announced
                             └── Live leaderboard updated
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
     (Round < 3)                                           (Round == 3)
   [ NEXT ROUND ]                                       [ VICTORY PODIUM ]
   Proceed to Q2/Q3                                     Gold/Silver Medals
                                                        Canvas Confetti Burst
                                                        Rematch Option
```

---

## 🔌 API Specification

All endpoints communicate using standard JSON payloads over HTTP `POST` and `GET`.

| Endpoint | Method | Description | Request Body / Parameters |
| :--- | :---: | :--- | :--- |
| `/api/create` | `POST` | Generates a new arena room with 7-char code and host player | `{ "name": "HostName" }` |
| `/api/join` | `POST` | Connects a challenger to an existing room | `{ "code": "BLTZ789", "name": "Challenger" }` |
| `/api/state` | `GET` | Fetches the real-time room state | Query: `?code=BLTZ789` |
| `/api/start` | `POST` | Host launches the match from lobby | `{ "code": "BLTZ789", "playerId": "uuid" }` |
| `/api/answer`| `POST` | Submits player answer index and timestamps | `{ "code": "BLTZ789", "playerId": "uuid", "answerIndex": 2 }` |
| `/api/next` | `POST` | Advances the arena to the next round | `{ "code": "BLTZ789", "playerId": "uuid" }` |
| `/api/restart`| `POST`| Resets game with fresh shuffled questions | `{ "code": "BLTZ789", "playerId": "uuid" }` |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) version **20.0.0 or higher**.

### Method 1: Windows One-Click Quick Launch
Double-click the **`START-WINDOWS.bat`** file located in the project root.
- Automatically checks for Node.js installation.
- Starts the server on port **`3001`**.
- Spawns your default web browser directly to `http://localhost:3001`.

### Method 2: Command Line (PowerShell / Bash / Command Prompt)

```bash
# 1. Navigate to the project directory
cd MindBlitz-Multiplayer-Arena

# 2. Install optional cloud dependencies
npm install

# 3. Start the MindBlitz server
npm start
```

The game server is now live at **`http://localhost:3001`**.

---

## 📱 Cross-Device Local Network Play (Wi-Fi)

To play against friends or classmates on mobile phones connected to the same local Wi-Fi:

1. Open PowerShell / Command Prompt and find your computer's local IP address:
   ```bash
   ipconfig
   ```
   *Look for `IPv4 Address` under your active Wi-Fi adapter (e.g., `10.3.23.129` or `192.168.1.15`).*

2. On your smartphone's browser (Safari, Chrome, Firefox), enter:
   ```text
   http://YOUR-IP-ADDRESS:3001
   Example: http://10.3.23.129:3001
   ```

3. Host the game on your laptop, share the 7-character code, and join from your phones!

---

## 🧪 Build Verification & Automated Testing

A dedicated build verification script is included to validate that all required modules, frontend views, server handlers, and Netlify configurations are correctly wired.

```bash
npm run build
```

**Expected Output:**
```text
Build check passed: MindBlitz frontend, local server, and Netlify function files are present and verified.
```

---

## 📂 Repository File Structure

```text
├── index.html                  # Single-page web application markup & inline SVG asset suite
├── styles.css                  # Obsidian design system, responsive grids, and neon tokens
├── app.js                      # Client state controller, Web Audio SFX, Confetti engine & polling loop
├── server.mjs                  # Native Node.js HTTP server & in-memory room management engine (Port 3001)
├── package.json                # Project manifest, npm run scripts, and engine specifications
├── package-lock.json           # Dependency lockfile
├── START-HERE.txt              # Quick orientation and gameplay rules text file
├── START-WINDOWS.bat           # Automated Windows batch launcher for port 3001
├── netlify.toml                # Netlify deployment headers, security policies, and redirect rules
├── netlify/
│   └── functions/
│       └── game.mjs            # Serverless cloud backend powered by @netlify/blobs
└── scripts/
    └── build-check.mjs         # Automated smoke-testing and file integrity check
```

---

## 📝 Academic Submission Declaration

- **Project Title**: MindBlitz — Real-Time Multiplayer Trivia Arena
- **Application Type**: Full-Stack Real-Time Web Application
- **Core Technologies**: HTML5, Vanilla CSS3, Modern JavaScript (ES6+), Node.js, Web Audio API, HTML5 Canvas API
- **Evaluation Notice**: This software has been independently engineered as an interactive multiplayer quiz engine. All state management, audio generation, and client-server synchronization have been built from the ground up without third-party frontend frameworks.
