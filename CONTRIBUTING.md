# Contributing to MatchDay 26

Thank you for your interest in contributing! This guide covers everything you need to get started.

---

## Project Structure

```
matchday26/
├── api/                    # Vercel serverless functions (Node.js, JSDoc-typed)
│   ├── _lib/helpers.js     # Shared utilities — KB loader, prompt builder, tools
│   ├── chat.js             # AI chat with reasoning + tool calling
│   ├── weather.js          # Live weather (Open-Meteo)
│   ├── lost-found.js       # Lost item reports
│   ├── crowd-report.js     # Crowd state updates
│   ├── concierge/          # Vapi system prompt endpoint
│   └── exit-plan/          # Exit plan generation + polling
├── src/
│   ├── components/         # Shared UI — TicketCard, AppHeader, StadiumShops, etc.
│   ├── constants/          # Application-wide constants (no magic values in components)
│   ├── context/            # React contexts — VoiceContext
│   ├── features/           # Feature modules (concierge, congestion, weather, match, exit-plan)
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Mock/seed data
│   ├── store/              # Zustand global state
│   └── test/               # Vitest test suites
├── server/                 # Local Express server (dev only — mirrors the Vercel API routes)
└── public/                 # Static assets (images, icons, logo)
```

---

## Development Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Install
```bash
git clone https://github.com/shivayogihugar47-spec/Matchday26.git
cd Matchday26
npm install
cd server && npm install && cd ..
```

### Environment
```bash
cp .env.example .env
# Fill in OPENROUTER_API_KEY, VITE_VAPI_PUBLIC_KEY, VITE_VAPI_ASSISTANT_ID
```

### Run locally
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
npm run dev
```

---

## Code Standards

### JavaScript / JSX
- All files use `// @ts-check` at the top for lightweight type checking
- Every exported function must have a JSDoc comment with `@param`, `@returns`, and `@example`
- Use `@typedef` for complex object shapes — see `api/_lib/helpers.js` as the reference
- No magic numbers or strings — add constants to `src/constants/index.js`
- No unused imports or variables — the linter enforces this

### Styling
- Tailwind CSS only — no inline `style` except for dynamic values (e.g. `boxShadow` that depend on runtime state)
- No framer-motion — all animations use CSS transitions
- Mobile-first — every component must work on 320px width

### Accessibility
- Every interactive element needs `aria-label` or visible label text
- Use semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<button>`, `<form>`)
- All images need `alt` text — decorative images use `alt=""` + `aria-hidden="true"`
- Focus rings must be visible — use `focus:outline-none focus:ring-2 focus:ring-*` pattern

### API Routes
- All routes must: set CORS headers, handle OPTIONS preflight, validate HTTP method, validate required inputs
- Use JSDoc `@typedef` for request/response shapes
- Never expose API keys or internal logic to the client
- Always return `{ success: boolean, data: ... }` shape for consistency

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Requirements
- Every new API route handler needs tests in `src/test/api.test.js`
- Every new utility function needs tests in the relevant test file
- Test descriptions must read as specifications: `it('returns 400 when description is missing')`
- Mock external dependencies — tests must not make real HTTP calls

---

## Pull Request Process

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`
2. Make your changes following the code standards above
3. Run `npm run lint` — must pass with zero errors
4. Run `npm test` — all tests must pass
5. Run `npm run build` — must build without errors
6. Open a PR with a clear description of what changed and why

---

## Commit Convention

```
feat: add feature
fix: fix bug
docs: update documentation
test: add or update tests
refactor: code change with no behaviour change
perf: performance improvement
chore: dependency updates, config changes
```
