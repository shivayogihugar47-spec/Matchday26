# MatchDay 26

MatchDay 26 is a polished FIFA World Cup stadium experience app for MetLife Stadium. The experience combines a live match/status dashboard, concierge interactions, crowd reporting, wayfinding, and quick-action cards into a single fan-facing shell.

## What this app does

- Shows the final match countdown and status badge
- Surfaces weather, crowd, and gate information in a calmer, more editorial UI
- Supports concierge chat, voice-ready flows, and structured exit-plan / lost-and-found handoffs
- Uses a real data-source label system so the UI clearly distinguishes live-verified data from local reference fallback data

## Tech stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Zustand, React Query
- Backend: Express server in the server folder
- Optional integrations:
  - football-data.org for live fixture data when a key is present
  - OpenRouter for concierge AI responses when OPENROUTER_API_KEY is set
  - Vapi for voice concierge when the public key and assistant ID are present

## Local development

1. Install dependencies from the app root:
   - npm install
2. Start the frontend dev server:
   - npm run dev
3. Start the backend server in a separate terminal:
   - cd server
   - npm install
   - npm run dev

## Environment variables

Create a .env file in the app root for frontend-only keys such as VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID.

Create a .env file in the server folder for server-side secrets such as:
- FOOTBALL_DATA_API_KEY
- OPENROUTER_API_KEY
- PORT
- CORS_ORIGIN

## Data honesty and fallback behavior

The app is intentionally explicit about what is live versus what is reference data:
- If football-data.org is configured and returns a match fixture, the UI tags it as live/verified.
- If the live integration is unavailable, the app falls back to the bundled knowledge base and clearly labels those values as reference data.
- The match card only renders live-score content when the backend reports an active match.

## Production build

Run:
- npm run build

## Security notes

The backend applies rate limiting, origin restrictions, payload-size limits, and basic sanitization for crowd-report and concierge inputs so the API behaves more defensively than a prototype. The frontend also uses the Vite proxy for API calls instead of hard-coded localhost URLs where practical.
