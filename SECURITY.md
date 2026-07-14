# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅ Yes    |

---

## Reporting a Vulnerability

If you discover a security vulnerability in MatchDay 26, please **do not** open a public GitHub issue.

Instead, email the maintainer directly with:
- A description of the vulnerability
- Steps to reproduce
- Potential impact assessment

We will respond within 48 hours and aim to release a fix within 7 days of confirmation.

---

## Security Architecture

### API Key Protection
- All API keys (`OPENROUTER_API_KEY`, `VITE_VAPI_PUBLIC_KEY`) are stored as environment variables — never hardcoded or committed
- Server-side keys are only accessible in Vercel serverless functions — never exposed to the browser bundle
- `VITE_*` keys are public by design (Vapi public key is safe to expose per Vapi's documentation)

### Input Validation
- All API endpoints validate required fields before processing (`description` on `/api/lost-found`, `message` on `/api/chat`)
- HTTP method guards (`405 Method Not Allowed`) on every endpoint
- Request bodies are parsed by Vercel's built-in body parser with default size limits

### AI Safety
- The AI concierge uses a **grounded system prompt** — responses are anchored to the verified MetLife Stadium knowledge base, reducing hallucination risk
- Tool execution (Lost & Found filing) happens **server-side only** — the client never directly calls tool handlers
- The AI is instructed to never invent gate numbers or section data — it defers to "check the stadium app" for uncertain facts

### CORS Policy
- All API routes set `Access-Control-Allow-Origin: *` — appropriate for a public fan-facing service
- For production with authentication, this should be restricted to the specific app domain

### Data Privacy
- No personally identifiable information (PII) is persisted beyond the serverless function lifecycle
- Lost & Found reports are logged to stdout only — not stored in any database
- No user tracking, cookies, or analytics are implemented

### Dependency Security
- Dependencies are pinned to exact minor versions to prevent supply-chain drift
- `npm audit` is run as part of the CI pipeline
- Unused dependencies (`framer-motion`, `react-hook-form`, `zod`) have been removed to reduce attack surface

---

## Known Limitations (Demo Scope)

- **No authentication** — the API is fully public. Production deployment should add rate limiting and authentication.
- **In-memory state** — exit plan and crowd zone data reset on serverless cold starts. Production should use persistent storage.
- **No request rate limiting** — a production deployment should add Vercel's edge rate limiting or an API gateway.
