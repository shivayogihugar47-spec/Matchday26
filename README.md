<div align="center">

# 🏟️ MatchDay 26

### AI-Powered Fan Intelligence Platform for FIFA World Cup 2026

**Real-time crowd intelligence · Voice concierge · Smart exit planning · Lost & found automation**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://matchday2k6.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-181717?style=for-the-badge&logo=github)](https://github.com/shivayogihugar47-spec/Matchday26)
[![Tests](https://img.shields.io/badge/Tests-110%20passing-brightgreen?style=for-the-badge&logo=vitest)](./src/test)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)

<br/>

![MatchDay 26 Banner](./public/logo.png)

</div>

---

## 📖 Overview

MatchDay 26 is a full-stack fan companion built for the **FIFA World Cup 2026 at MetLife Stadium**, East Rutherford NJ. It combines live match data, AI-powered chat, voice concierge, crowd crowd congestion mapping, stadium eats discovery, and automated lost & found — all in a single polished dashboard optimized for mobile.

Built as an entry for **Prompt Wars Challenge 4** by Hack2skill × Google for Developers.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏆 **Live Match Dashboard** | Countdown timer, live score, team voting, and match timeline |
| 🌤️ **Real-Time Weather** | Live conditions via Open-Meteo API, no key required |
| 🤖 **AI Concierge Chat** | Multi-turn reasoning chat powered by `tencent/hy3:free` via OpenRouter |
| 🎙️ **Voice Concierge** | Full voice call via Vapi with dynamic system prompt injection from the knowledge base |
| 📦 **Lost & Found Automation** | Describe what you lost in plain language — AI files the report and returns a reference number |
| 🗺️ **Crowd Radar Map** | Live gate congestion with fan-submitted crowd reports |
| 🚪 **Exit Plan Generator** | Personalized post-match exit routing by transport method and accessibility needs |
| 🍔 **Stadium Eats & Shops** | Photo cards for all concessions with menus and contact info |
| 🌍 **Multi-language** | English, Español, Français, Deutsch, Português, हिन्दी |
| ♿ **Accessibility Mode** | WCAG-aligned — elevator routing, ADA-first directions, reduced motion support |

---

## 🧠 How the AI Works

### Text Concierge
- Model: **`tencent/hy3:free`** via [OpenRouter](https://openrouter.ai) with **reasoning enabled**
- The model exposes its full chain-of-thought before answering — every response is reasoned, not just retrieved
- **Multi-turn memory** — `reasoning_details` are preserved and passed back on every turn so context never resets mid-conversation

### Tool Calling — Lost & Found
```
User: "I lost my blue backpack near Section 114"
  → AI extracts: itemType, description, lastSeenLocation
  → Server calls /api/lost-found internally
  → Returns reference number LF-XXXXXXX
  → AI writes a warm confirmation message
```
No forms. No friction. One message.

### Voice Concierge
- **Vapi SDK** handles the call transport
- At call time, the server builds a fresh system prompt from the **MetLife Stadium knowledge base** (`metlife_deep_knowledge_base.json`)
- Every answer is grounded in verified venue data — gates, elevators, transport, payment policy
- Vapi SDK is **lazy-loaded** — the 298KB bundle only downloads when the user taps the mic

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  Vite · Tailwind · Zustand · TanStack Query          │
│                                                     │
│  AppHeader   MatchCard   WeatherCard   Concierge    │
│  CrowdMap    StadiumShops  ExitPlan    MapPanel      │
└──────────────────────┬──────────────────────────────┘
                       │ /api/*
         ┌─────────────▼──────────────┐
         │   Vercel Serverless API    │
         │  api/                      │
         │  ├── chat.js               │  ← OpenRouter + tool calling
         │  ├── weather.js            │  ← Open-Meteo (free)
         │  ├── lost-found.js         │  ← Report filing
         │  ├── crowd-report.js       │  ← Crowd state updates
         │  ├── concierge/            │
         │  │   └── system-prompt.js  │  ← Vapi prompt builder
         │  ├── exit-plan/            │
         │  │   ├── generate.js       │  ← Exit plan logic
         │  │   └── latest.js         │  ← Poll for latest plan
         │  └── _lib/helpers.js       │  ← Shared KB + prompt utils
         └────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone the repo
```bash
git clone https://github.com/shivayogihugar47-spec/Matchday26.git
cd Matchday26
```

### 2. Install dependencies
```bash
npm install
cd server && npm install && cd ..
```

### 3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Required for AI chat
OPENROUTER_API_KEY=sk-or-v1-...

# Required for voice concierge
VITE_VAPI_PUBLIC_KEY=your_vapi_public_key
VITE_VAPI_ASSISTANT_ID=your_vapi_assistant_id

# Server port (default 3001)
PORT=3001
```

### 4. Run locally

Open two terminals:

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3001`

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage report
npm run test:coverage
```

**110 tests across 4 suites — 0 failures**

| Suite | Coverage |
|---|---|
| `helpers.test.js` | KB summary, system prompt builder, lost-found handler, tool definitions |
| `mockData.test.js` | Weather, match data, zone validation, all 6 language translations |
| `store.test.js` | All Zustand store actions and initial state |
| `api.test.js` | All 7 API route handlers |

---

## 🌐 Deployment

This project is configured for **single-repo Vercel deployment** — no separate backend needed.

```bash
npm run build
```

Vercel picks up the `/api` folder as serverless functions automatically. Set your environment variables in the Vercel dashboard under **Settings → Environment Variables**.

Required variables on Vercel:
- `OPENROUTER_API_KEY`
- `VITE_VAPI_PUBLIC_KEY`
- `VITE_VAPI_ASSISTANT_ID`

---

## ⚡ Performance

| Optimization | Impact |
|---|---|
| framer-motion removed entirely | −125KB JS (−41KB gzip) |
| Vapi SDK lazy-loaded | −298KB on initial load |
| All `backdrop-blur` removed | Smooth scroll on low-end mobile |
| Manual code splitting (8 chunks) | Parallel loading, better caching |
| CSS transitions only | No JS animation overhead |
| `refetchOnWindowFocus: false` | No re-renders on app switch |

---

## 🛠️ Tech Stack

**Frontend**
- [React 19](https://react.dev) · [Vite 8](https://vite.dev) · [Tailwind CSS 3](https://tailwindcss.com)
- [Zustand](https://zustand-demo.pmnd.rs) · [TanStack Query v5](https://tanstack.com/query)
- [React Leaflet](https://react-leaflet.js.org) · [React Markdown](https://github.com/remarkjs/react-markdown)

**Backend / API**
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [OpenRouter](https://openrouter.ai) — `tencent/hy3:free` with reasoning
- [Vapi](https://vapi.ai) — voice call infrastructure
- [Open-Meteo](https://open-meteo.com) — weather API (no key needed)

**Testing**
- [Vitest](https://vitest.dev) · [@testing-library/react](https://testing-library.com/react)

---

## 📁 Project Structure

```
matchday26/
├── api/                        # Vercel serverless functions
│   ├── _lib/helpers.js         # Shared KB, prompt builder, tools
│   ├── chat.js                 # AI chat with tool calling
│   ├── weather.js              # Live weather
│   ├── lost-found.js           # Lost item reports
│   ├── crowd-report.js         # Crowd state
│   ├── concierge/system-prompt.js
│   └── exit-plan/
├── src/
│   ├── components/             # Shared UI components
│   ├── features/               # Feature modules
│   │   ├── concierge/          # AI chat + voice
│   │   ├── congestion/         # Crowd map
│   │   ├── exit-plan/          # Exit planner
│   │   ├── match/              # Match card
│   │   └── weather/            # Weather card
│   ├── context/                # VoiceContext (shared Vapi instance)
│   ├── hooks/                  # useWeather, useVoiceConcierge, useMatchStatus
│   ├── store/                  # Zustand store
│   ├── services/               # Mock data
│   └── test/                   # 110 Vitest tests
├── server/                     # Local Express server (dev only)
├── public/                     # Static assets + food images
├── metlife_deep_knowledge_base.json  # Verified stadium knowledge
└── vercel.json                 # Vercel deployment config
```

---

## 📜 License

MIT © 2026 MatchDay 26

---

<div align="center">

Built for **Prompt Wars Challenge 4** · Hack2skill × Google for Developers

⭐ Star this repo if you found it useful

</div>
