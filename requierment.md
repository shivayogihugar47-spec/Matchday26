# MatchDayAI_Master_Prompt.md

## Part 1 — Product Vision, PRD & Engineering Mission

> **Version:** 1.0
> **Project:** MatchDay AI
> **Target:** Claude Code • Cursor • Windsurf • GPT-5.5 • Lovable • Bolt
> **Build Mode:** Production Ready

---

# MASTER INSTRUCTION

You are **not** acting as a chatbot.

You are acting as an **elite software engineering organization** composed of:

* Staff Software Engineers
* Principal AI Engineers
* Senior React Engineers
* Senior Node.js Engineers
* Solution Architects
* DevOps Engineers
* Product Designers
* UX Researchers
* Accessibility Specialists
* QA Engineers
* Technical Writers

Every decision must reflect production-quality engineering.

Never generate hackathon code.

Never generate demo code.

Never generate placeholder implementations.

Never stop after giving an architecture.

You are expected to completely build the application.

---

# PROJECT NAME

# MatchDay AI

**AI Matchday Concierge for FIFA World Cup 2026**

---

# PRODUCT VISION

MatchDay AI is an intelligent AI concierge designed exclusively for football fans attending FIFA World Cup 2026 matches at **MetLife Stadium**.

The objective is not simply to answer questions.

The objective is to remove uncertainty during the entire matchday.

Instead of dozens of disconnected features, the product revolves around one continuously evolving AI assistant that understands where the fan currently is in their journey.

The AI should feel like a knowledgeable stadium guide who always knows:

* current weather
* current match state
* stadium congestion
* transportation
* accessibility
* live fan reports
* previous conversation
* user's current phase

The fan should never need to explain their context repeatedly.

---

# CORE PROBLEM

Fans experience uncertainty throughout every stage of attending a World Cup match.

Examples include:

Before arrival:

* Which parking lot?
* Which gate?
* How long is security?
* Which entrance is faster?
* Is the weather changing?

Inside stadium:

* Which restroom has the shortest line?
* Where should I buy food?
* Is halftime crowded?
* Where is the closest accessible route?

After match:

* Which exit should I use?
* Is the train crowded?
* Should I wait before leaving?
* Which gate minimizes walking?

Today's stadium apps answer isolated questions.

MatchDay AI continuously understands the entire journey.

---

# PRODUCT PHILOSOPHY

This application intentionally serves only ONE persona.

No administrator portal.

No staff dashboard.

No security dashboard.

No venue management tools.

Everything exists to help football fans.

This focus is intentional.

Going deep into one problem is more valuable than shallow solutions for many users.

---

# PRIMARY PERSONA

## FIFA Match Attendee

Age

16–70

Technical Skill

Any

Language

English

Spanish

Hindi

Goals

Reach stadium smoothly

Find correct gate

Avoid long queues

Enjoy the match

Find food quickly

Leave efficiently

Navigate safely

Needs

Fast answers

Voice interaction

Reliable guidance

Minimal typing

Real-time information

Accessibility support

---

# SECONDARY CONDITIONS

The application must also work for:

Families

Tourists

First-time visitors

International visitors

Wheelchair users

Non-English speakers

Users unfamiliar with MetLife Stadium

---

# PRODUCT GOALS

The application must:

Reduce waiting

Reduce uncertainty

Improve navigation

Improve confidence

Reduce repeated searching

Provide trustworthy recommendations

Adapt automatically as the event progresses

Never overwhelm the user with information

---

# SUCCESS METRICS

Success is measured by:

Time required to answer fan questions

Speed of navigation

Reduced confusion

Fast AI responses

Voice interaction quality

Low latency

Accessibility compliance

Reliable fallbacks

High perceived intelligence

Premium user experience

---

# DESIGN PRINCIPLES

The application should feel:

Warm

Helpful

Trustworthy

Human

Confident

Fast

Premium

Never cold.

Never robotic.

Never generic.

---

# PRODUCT EXPERIENCE

The user should feel like they are carrying a smart match ticket that becomes more useful throughout the day.

Not a chatbot.

Not ChatGPT inside a website.

Instead:

A personal stadium concierge.

---

# MATCH PHASE MODEL

The entire product revolves around three phases.

---

## Phase 1

### PRE-MATCH

The fan is travelling to the stadium.

Primary concerns:

Parking

Security

Weather

Finding gate

Finding seat

Traffic

Transit

Accessibility

Suggested prompts:

Where do I park?

Which entrance is fastest?

Will it rain?

How long is security?

Where is Gate B?

---

## Phase 2

### LIVE MATCH

The fan is inside the stadium.

Primary concerns:

Restrooms

Food

Concessions

Queue times

Accessibility

Halftime

Nearest facilities

Suggested prompts:

Where is the nearest restroom?

Which food stall has the shortest line?

Can I reach Gate C before halftime ends?

---

## Phase 3

### POST MATCH

The fan is leaving.

Primary concerns:

Exit route

Transit

Traffic

Ride share

Parking

Walking route

Crowds

Suggested prompts:

How do I get to my car?

Which exit is least crowded?

Should I wait before leaving?

Where is the train station?

---

# PHASE DETECTION

Phase detection should happen automatically.

Priority:

1.

Live match API

↓

2.

Knowledge Base schedule

↓

3.

Simulation engine

Manual override must exist for demos.

Users should never notice fallback transitions.

---

# AI PHILOSOPHY

The concierge should behave differently in each phase.

Example:

Question:

"Where should I go?"

Pre-match:

Recommend entrance.

Live match:

Recommend nearest restroom.

Post-match:

Recommend exit gate.

The AI should reason from context rather than matching keywords.

---

# TRUST MODEL

Users should always know the origin of information.

Every data source must display one badge.

🟢 Live

Real-time API

📘 Reference

Knowledge Base

⚙️ Estimated

Simulation

Never fake live data.

Never hide uncertainty.

Never fabricate information.

---

# PRODUCT PRINCIPLES

Always prioritize:

Accuracy

Transparency

Speed

Graceful degradation

Accessibility

Maintainability

Scalability

Consistency

---

# ENGINEERING PRINCIPLES

Every implementation must satisfy:

Single Responsibility Principle

Open Closed Principle

Dependency Injection

Reusable Components

Strict Typing

Modular Services

Feature Isolation

Clean Architecture

Minimal Coupling

Maximum Readability

---

# CODING PRINCIPLES

Never write:

handleThing()

processData()

temp()

value1

value2

misc.js

utils.js containing unrelated functions

Prefer:

calculateExitRisk()

generateConciergePrompt()

WeatherService

CrowdReportAggregator

AccessibilityPlanner

RouteOptimizer

---

# PRODUCTION STANDARDS

Assume this application will be reviewed by:

Senior Engineers

Architecture Panels

FIFA Technology Partners

University Evaluators

Potential Investors

Code quality matters as much as functionality.

---

# NON-FUNCTIONAL REQUIREMENTS

The application must be:

Responsive

Accessible

Fast

Secure

Maintainable

Modular

Documented

Extensible

Internationalized

Production deployable

---

# PERFORMANCE TARGETS

First load:

< 2 seconds

Voice latency:

< 2 seconds

Weather refresh:

60 seconds

Match refresh:

60 seconds

AI response:

Prefer under 3 seconds

Interactive UI:

60 FPS animations

---

# ACCESSIBILITY REQUIREMENTS

WCAG AA

Keyboard navigation

Visible focus states

Screen reader compatibility

High contrast

Large tap targets

Semantic HTML

ARIA where necessary

Reduced motion support

---

# INTERNATIONALIZATION

Supported languages:

English

Spanish

Hindi

The language switcher should update:

UI labels

Voice assistant

Speech recognition

Speech synthesis

AI prompts

Lost & Found announcements

# MatchDayAI_Master_Prompt.md

## Part 2 — System Architecture, OpenRouter AI, Vapi Voice, Backend Services & Data Flow

---

# SYSTEM ARCHITECTURE

The application must follow a clean, modular, production-ready architecture. Every layer has a single responsibility and communicates through well-defined interfaces.

```text
                        ┌─────────────────────┐
                        │      React App      │
                        └──────────┬──────────┘
                                   │
                     TanStack Query / Zustand
                                   │
                        ┌──────────▼──────────┐
                        │    Express Backend   │
                        └──────────┬──────────┘
         ┌──────────────┬──────────┼──────────┬──────────────┐
         ▼              ▼          ▼          ▼              ▼
 Weather Service   Match Service   AI Service Crowd Service Map Service
         │              │          │          │              │
 Open-Meteo      football-data  OpenRouter  In-Memory      OSRM
```

The frontend **never calls third-party APIs directly** (except Vapi and OpenStreetMap tiles where appropriate). All secrets remain on the backend.

---

# PROJECT STRUCTURE

```text
matchday-ai/
│
├── client/
│   ├── src/
│   │   ├── app/
│   │   ├── features/
│   │   │   ├── concierge/
│   │   │   ├── weather/
│   │   │   ├── match/
│   │   │   ├── congestion/
│   │   │   ├── exit-plan/
│   │   │   ├── lost-found/
│   │   │   ├── accessibility/
│   │   │   └── voice/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── assets/
│   │   └── styles/
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   ├── providers/
│   ├── cache/
│   ├── models/
│   ├── utils/
│   ├── config/
│   └── types/
│
├── shared/
│
├── docs/
│
└── README.md
```

No file should exceed approximately **200 lines**. Split responsibilities into focused modules.

---

# FRONTEND ARCHITECTURE

Use:

* React 19
* Vite
* TypeScript
* TailwindCSS
* shadcn/ui
* Framer Motion
* TanStack Query
* Zustand
* React Hook Form
* Zod

The frontend should remain as stateless as practical, with server state handled by TanStack Query and UI/session state by Zustand.

---

# BACKEND ARCHITECTURE

Use:

* Node.js
* Express
* TypeScript

Organize by feature, not by file type alone.

Every controller should:

* validate input
* call one service
* return typed responses
* never contain business logic

Business logic belongs in services.

---

# AI ARCHITECTURE

## Provider Strategy

Use **OpenRouter** as the single AI gateway.

Never call model providers directly.

```text
Frontend
     │
     ▼
Express API
     │
     ▼
OpenRouter Provider
     │
     ▼
Selected Model
```

Environment variable:

```text
OPENROUTER_API_KEY=
```

Default model:

```text
openai/gpt-4.1-mini
```

Support easy switching to:

* anthropic/claude-3.7-sonnet
* google/gemini-2.5-pro
* meta-llama/llama-3.3-70b-instruct
* mistralai/mistral-small-3.2

No code changes should be required to change models.

---

# AI SERVICE STRUCTURE

```text
services/
    ai/
        AIProvider.ts
        OpenRouterProvider.ts
        PromptBuilder.ts
        PromptContext.ts
        AIResponseCache.ts
        AIResponseFormatter.ts
```

Each module has one responsibility.

---

# PROMPT BUILDING

Every AI request must include structured context:

* current phase
* weather
* live match status
* congestion
* fan reports
* accessibility preference
* current language
* conversation history
* user's latest message

The AI should reason using structured context rather than raw text concatenation.

---

# AI CACHING

Avoid unnecessary LLM requests.

Cache key should include:

* phase
* congestion tier
* weather condition
* accessibility mode
* language
* user question

TTL:

15–30 seconds

Invalidate cache when:

* phase changes
* weather changes significantly
* congestion crosses thresholds
* user asks a different question

---

# AI FALLBACK STRATEGY

1. OpenRouter request
2. Retry once
3. Use cached answer if appropriate
4. Use intelligent rule-based response

The user must never experience an infinite loading state.

Every response displays:

* 🤖 OpenRouter
* Model name
* ⚡ Rule-Based (if fallback used)

---

# VAPI VOICE ARCHITECTURE

Replace the browser Web Speech API with **Vapi AI**.

Environment variables:

```text
VITE_VAPI_PUBLIC_KEY=
VITE_VAPI_ASSISTANT_ID=
```

Requirements:

* continuous conversations
* streaming responses
* interruption handling
* multilingual
* reconnect automatically
* low latency
* voice activity detection

Voice status indicators:

* Connected
* Listening
* Thinking
* Speaking
* Disconnected

---

# VOICE CONTEXT

The voice assistant must always receive:

* current phase
* AI conversation history
* weather
* match status
* congestion
* accessibility settings
* selected language

Voice and text interactions share the same conversation memory.

---

# DATA SERVICES

Create one service per external source.

```text
WeatherService
MatchStatusService
KnowledgeBaseService
CrowdReportService
AIService
MapRoutingService
AccessibilityService
```

No service should know about another service's implementation details.

---

# WEATHER SERVICE

Source:

Open-Meteo

Refresh interval:

60 seconds

Fallback:

last successful response

Then:

reference data

Then:

simulated weather (clearly labeled)

---

# MATCH STATUS SERVICE

Source:

football-data.org

Competition:

WC

Filter:

MetLife Stadium

Polling:

60 seconds maximum

Fallback order:

1. Live API
2. Knowledge base schedule
3. Simulation

Never mislabel simulated data as live.

---

# KNOWLEDGE BASE

Load the supplied JSON.

Extract only:

MetLife Stadium.

Ignore every other stadium.

Include a code comment noting that gate references are simplified according to the knowledge base confidence notes.

---

# CROWD REPORT SERVICE

Store reports in memory.

Each report contains:

* zone
* report type
* timestamp

Report types:

* Crowded
* Clear
* Long Line

Use recency weighting.

Only reports from the last 10 minutes affect congestion.

Maximum adjustment:

±15%.

---

# CONGESTION ENGINE

Congestion is modeled differently by phase:

Pre-Match:

Entry gates

Live Match:

Food and restrooms

Post-Match:

Exit routes

The model should follow realistic crowd curves tied to the detected match phase.

---

# MAP SERVICE

Use:

Leaflet

OpenStreetMap

OSRM

No Google Maps.

No paid APIs.

Display:

* stadium
* zones
* walking routes
* congestion overlays

---

# API ROUTES

```text
GET /api/weather
GET /api/match
GET /api/congestion
GET /api/map
POST /api/chat
POST /api/voice/context
POST /api/lost-person
POST /api/report-sighting
POST /api/report-crowd
POST /api/exit-plan
```

All routes must:

* validate input
* return typed responses
* handle errors gracefully

---

# ERROR HANDLING

Every external API call:

* try/catch
* timeout
* retry once (where appropriate)
* structured error response
* logging

Never expose internal stack traces to users.

---

# OBSERVABILITY

Implement:

* request logging
* API timing
* AI response timing
* cache hit rate
* fallback events

These metrics should be available in a small developer panel.

---

# SECURITY

Never expose API keys.

Validate all user input with Zod.

Rate-limit AI endpoints.

Sanitize prompts to reduce prompt injection risks.

Do not trust external API responses without validation.

---

# CONFIGURATION

Provide:

* `.env.example`
* typed config loader
* startup validation for required environment variables
* descriptive startup errors if configuration is incomplete

# MatchDayAI_Master_Prompt.md

## Part 4A — Backend Architecture, State Management, API Contracts, OpenRouter Pipeline & Vapi Voice Orchestration

---

# BACKEND ARCHITECTURE

The backend is the intelligence layer of MatchDay AI. It aggregates real-time data, enriches it with modeled insights, orchestrates AI requests, and exposes a clean API to the frontend.

The backend must **never** expose API keys or provider-specific logic to the client.

Core principles:

* Thin controllers
* Business logic in services
* Provider abstraction
* Typed interfaces
* Graceful degradation
* Comprehensive logging
* Testability

---

# REQUEST FLOW

```text
User
   │
   ▼
React Frontend
   │
   ▼
Express API
   │
   ├────────► Validation (Zod)
   │
   ├────────► Authentication (optional future layer)
   │
   ├────────► Rate Limiter
   │
   ├────────► Controller
   │
   ├────────► Service
   │
   ├────────► Cache
   │
   ├────────► External APIs
   │
   ▼
Response Formatter
   │
   ▼
Frontend
```

---

# APPLICATION LAYERS

## Presentation Layer

Routes

Controllers

Response Formatter

---

## Business Layer

AI Service

Match Service

Weather Service

Congestion Service

Exit Planner

Lost & Found Service

Accessibility Service

---

## Infrastructure Layer

OpenRouter Provider

Football API Provider

Weather Provider

OSRM Provider

Knowledge Base Loader

Vapi Context Service

---

## Shared Layer

Logger

Config

Types

Validation

Constants

Utilities

---

# STATE MANAGEMENT

## Frontend State

Use Zustand only for:

* Current phase
* Accessibility mode
* Selected language
* Voice state
* Current route
* Demo mode
* Developer panel state

Everything else should use TanStack Query.

---

## Server State

TanStack Query manages:

* Weather
* Match status
* AI responses
* Exit plan
* Crowd reports
* Lost person reports

---

# CACHE STRATEGY

Each data source has its own cache policy.

| Source        | Cache     | Refresh      |
| ------------- | --------- | ------------ |
| Weather       | 60 sec    | Poll         |
| Match Status  | 60 sec    | Poll         |
| AI            | 15–30 sec | Event Driven |
| Crowd Reports | Live      | Push/Poll    |
| Exit Plan     | On Demand | Regenerate   |

Cache invalidation must be explicit.

---

# API DESIGN PRINCIPLES

Every endpoint:

* Typed request
* Typed response
* Validation
* Error object
* Metadata
* Timestamp
* Source badge

Example response:

```json
{
  "success": true,
  "timestamp": "...",
  "source": "Live",
  "data": {}
}
```

---

# API ROUTES

## Weather

GET

```text
/api/weather
```

Returns

* Temperature
* Wind
* Rain
* Humidity
* Update time

---

## Match

GET

```text
/api/match
```

Returns

* Teams
* Score
* Minute
* Status
* Kickoff
* Venue

---

## Congestion

GET

```text
/api/congestion
```

Returns

Zone objects

Current congestion

Trend

Fan reports

Confidence

---

## Chat

POST

```text
/api/chat
```

Request

```json
{
  "message": "...",
  "language": "en",
  "phase": "LIVE"
}
```

Returns

AI response

Model

Latency

Confidence

Source

---

## Exit Plan

POST

```text
/api/exit-plan
```

Returns

Recommended gate

Walking route

Transit

Estimated duration

Warnings

Alternative route

---

## Crowd Report

POST

```text
/api/report-crowd
```

Accepts

Zone

Report Type

Timestamp

---

## Lost Person

POST

```text
/api/lost-person
```

Returns

Generated announcement

Dispatch note

Reference ID

---

## Sighting

POST

```text
/api/report-sighting
```

Returns

Similarity score

Possible matches

---

# DATA MODELS

## Weather

```typescript
interface Weather {
 temperature:number
 wind:number
 humidity:number
 rain:number
 source:"live"|"reference"|"simulated"
}
```

---

## Match

```typescript
interface MatchStatus {
 phase
 minute
 score
 home
 away
 kickoff
 venue
 source
}
```

---

## Crowd Report

```typescript
interface CrowdReport{
 zone
 type
 createdAt
}
```

---

## Zone Status

```typescript
interface ZoneStatus{
 id
 name
 congestion
 waitTime
 trend
 confidence
 reportCount
}
```

---

## Exit Plan

```typescript
interface ExitPlan{
 gate
 route
 estimatedMinutes
 transport
 accessibility
 alerts
}
```

---

# OPENROUTER ARCHITECTURE

OpenRouter is the single LLM gateway.

Never couple business logic to a specific provider.

```text
Frontend
      │
      ▼
Express
      │
      ▼
AIService
      │
      ▼
OpenRouterProvider
      │
      ▼
Configured Model
```

---

# MODEL CONFIGURATION

Configuration file

```text
config/models.ts
```

Supports

* GPT
* Claude
* Gemini
* Llama
* Mistral

Changing providers should only require editing configuration.

---

# PROMPT BUILDER

Never concatenate raw strings throughout the application.

Create one PromptBuilder responsible for assembling structured prompts.

Input:

* Weather
* Match
* Phase
* Accessibility
* Fan reports
* Conversation history
* User message

Output

One optimized prompt.

---

# SYSTEM PROMPT

The system prompt should define the AI as:

> MatchDay AI Concierge

Responsibilities

* Never invent facts.
* Explain uncertainty.
* Prefer official information.
* Use available context.
* Recommend actions.
* Keep answers concise.
* Mention data source when appropriate.

---

# RESPONSE PIPELINE

```text
User Question
        │
        ▼
Prompt Builder
        │
        ▼
OpenRouter
        │
        ▼
Response Validator
        │
        ▼
Formatter
        │
        ▼
Frontend
```

---

# RESPONSE VALIDATION

Reject responses that:

* hallucinate unavailable data
* reference unsupported features
* expose internal prompts
* contradict live data

Fallback to rule-based recommendations if validation fails.

---

# TOKEN MANAGEMENT

Limit responses.

Target

250–400 tokens.

Use concise answers.

Avoid long essays.

---

# STREAMING

Enable streaming responses when supported.

UI should progressively render AI output.

Do not wait for full completion before displaying text.

---

# VAPI ARCHITECTURE

Voice interaction is a first-class feature.

Vapi manages:

* microphone
* speech recognition
* speech synthesis
* interruptions
* streaming

Business context remains on your backend.

---

# VAPI EVENT FLOW

```text
User taps microphone
          │
          ▼
Voice Connected
          │
          ▼
Listening
          │
          ▼
Speech Recognized
          │
          ▼
Backend Context Update
          │
          ▼
OpenRouter Response
          │
          ▼
Streaming Speech
          │
          ▼
Conversation Saved
```

---

# CONVERSATION MEMORY

Maintain a rolling conversation history.

Recommended

Last 10 exchanges.

Always include

* user intent
* previous recommendations
* current phase

Avoid unbounded history growth.

---

# CONTEXT OBJECT

Every AI request receives one structured object.

Example

```typescript
{
 phase,
 weather,
 match,
 congestion,
 accessibility,
 language,
 reports,
 conversation
}
```

Never require the model to infer available context from unrelated text.

---

# ERROR HANDLING

If OpenRouter fails

↓

Retry

↓

Cached answer

↓

Rule-based answer

↓

User notification

The application should always provide a useful response.

---

# RATE LIMITING

Protect AI endpoints.

Recommended

20 requests/minute per session.

Crowd reporting

30 submissions/minute.

Lost person

5 submissions/minute.

---

# LOGGING

Log

* Request ID
* Endpoint
* Duration
* Provider
* Model
* Cache hit
* Errors
* Retry count

Never log secrets or user voice transcripts in production.

---

# DEVELOPER PANEL

Hidden behind a toggle.

Displays

Current phase

Weather source

Match source

AI model

Cache status

Voice status

API latency

Fallback events

OpenRouter model

Vapi connection state

Reset demo

Force phase

Clear cache

---

# MatchDayAI_Master_Prompt.md

## Part 4B — Feature Specifications, Business Logic, Notifications, Analytics & Acceptance Criteria

---

# FEATURE IMPLEMENTATION PRINCIPLES

Every feature must satisfy these principles:

* Solves a real fan problem.
* Uses live or honestly labeled data.
* Degrades gracefully if APIs fail.
* Is accessible by keyboard and screen readers.
* Works on desktop and mobile.
* Shares context with the AI concierge.
* Is fully documented and tested.

No feature should exist in isolation.

---

# FEATURE 1 — AI MATCHDAY CONCIERGE

## Objective

Provide one continuous AI assistant that adapts automatically to the user's matchday phase.

### Responsibilities

* Answer natural-language questions.
* Recommend actions instead of only providing information.
* Explain uncertainty when necessary.
* Remember recent conversation.
* Use structured context from backend services.

### AI Context Inputs

* Match phase
* Live match status
* Weather
* Zone congestion
* Fan reports
* Accessibility preference
* Language
* Conversation history
* Current map destination (if any)

### Example Behavior

**Pre-Match**

Question:

> "Where should I go?"

Answer should recommend:

* Best gate
* Security wait
* Weather considerations

**Live Match**

Recommend:

* Nearby restroom
* Shortest concession queue

**Post-Match**

Recommend:

* Exit gate
* Transport
* Walking route

Never return the same generic response across phases.

---

# FEATURE 2 — EXIT PLANNER

## Objective

Generate a personalized exit strategy.

### User Inputs

* Drove
* Train
* Bus
* Rideshare
* Walking

### AI Must Produce

* Recommended exit gate
* Walking route
* Estimated walking time
* Estimated queue
* Transit recommendation
* Alternative route
* Accessibility adjustments
* Confidence level

### Dynamic Updates

If congestion changes significantly after a plan is generated:

* Notify the user.
* Explain why the recommendation changed.
* Offer a one-tap "Regenerate Exit Plan."

---

# FEATURE 3 — CROWD INTELLIGENCE

## Objective

Blend modeled congestion with crowdsourced reports.

### Zones

* Gate A
* Gate B
* Gate C
* Gate D

### Report Types

* 🔴 Crowded
* 🟢 Clear
* 🟠 Long Line

### Business Rules

* Use only reports from the last 10 minutes.
* Weight newer reports more heavily.
* Cap adjustment at ±15%.
* Display the number of recent reports.

Never allow user reports to overwhelm the modeled baseline.

---

# FEATURE 4 — LOST & FOUND COORDINATION

## Objective

Support text-only reporting for lost people and sightings.

### Lost Person Form

Fields:

* Age range
* Clothing description
* Last-seen zone
* Preferred language
* Additional notes

### AI Output

1. Structured multilingual PA announcement.
2. Internal dispatch note.
3. Case reference ID.

### Sighting Flow

Collect:

* Zone
* Description
* Free-text observation

Use AI text comparison to estimate similarity to active cases.

Never use:

* Images
* CCTV
* Facial recognition
* Biometrics

---

# FEATURE 5 — ACCESSIBILITY

## Objective

Provide inclusive navigation.

### Toggle

"I need accessible routing."

When enabled:

* Prefer step-free paths.
* Highlight accessible entrances/exits.
* Adjust Exit Plan.
* Include accessibility notes in AI responses.

Preference should persist during the session.

---

# FEATURE 6 — INTERACTIVE MAP

## Objective

Provide real-time spatial context.

### Display

* Stadium
* Gates
* Zones
* Congestion overlays
* Walking route
* Accessible route (if enabled)

### Interactions

* Tap a zone to view details.
* Request directions.
* Generate AI recommendation.
* Report congestion.

Use Leaflet + OpenStreetMap + OSRM only.

---

# FEATURE 7 — MULTILINGUAL EXPERIENCE

Supported languages:

* English
* Spanish
* Hindi

Switching language updates:

* UI text
* AI prompts
* Voice assistant
* Lost & Found announcements
* Notifications

The active language must be included in every AI request.

---

# FEATURE 8 — VOICE EXPERIENCE

Voice is a primary interaction mode.

### States

* Connecting
* Connected
* Listening
* Thinking
* Speaking
* Idle
* Error

### Requirements

* Push-to-talk
* Continuous conversation
* Interruptible responses
* Streaming playback
* Shared context with text chat

Voice failures should automatically fall back to text.

---

# FEATURE 9 — NOTIFICATIONS

Use non-intrusive toast notifications for:

* Weather changes
* Match phase changes
* Exit plan updates
* Crowd report confirmation
* Lost person submission
* Voice connection status

Avoid modal dialogs unless critical.

---

# FEATURE 10 — DEVELOPER PANEL

Hidden by default.

Include:

* Current phase
* Weather source
* Match source
* AI model
* Cache hits
* Cache misses
* API latency
* OpenRouter model
* Vapi status
* Active language
* Accessibility state

Controls:

* Force phase
* Clear cache
* Reset demo
* Simulate API failure

---

# ANALYTICS (LOCAL ONLY)

Collect anonymous runtime metrics only.

Examples:

* AI response latency
* Cache hit rate
* Weather refresh duration
* Match API duration
* Voice session length
* Exit plan generation time

Do not collect personally identifiable information.

---

# VALIDATION RULES

Validate all user input with Zod.

Reject:

* Empty submissions
* Invalid transport modes
* Unsupported languages
* Oversized text fields

Provide clear, user-friendly validation messages.

---

# ERROR HANDLING

Every feature must define:

* Loading state
* Empty state
* Error state
* Recovery action

Never leave the user without guidance.

---

# ACCEPTANCE CRITERIA

The implementation is complete only if:

* AI concierge answers correctly for all three phases.
* OpenRouter integration supports model switching.
* Vapi voice works for multilingual conversations.
* Live weather updates every 60 seconds.
* Match status updates every 60 seconds.
* Congestion model reacts to crowd reports.
* Exit Plan adapts to changing conditions.
* Lost & Found generates structured announcements.
* Accessibility mode affects routing and AI responses.
* Map displays routes and congestion overlays.
* All external API failures trigger graceful fallbacks.
* Every screen is responsive.
* Every screen is accessible.
* Every component is reusable.
* Every API route is documented.
* Every environment variable is documented.
* README setup instructions are verified.
* Unit, integration, and end-to-end tests pass.

---

# SELF-REVIEW CHECKLIST

Before considering the project complete, verify:

* No placeholder components remain.
* No TODO comments remain.
* No hard-coded API keys exist.
* No duplicated business logic exists.
* No file exceeds the target size without justification.
* All external services are abstracted behind interfaces.
* All AI responses display their source/model.
* All simulated data is clearly labeled.
* The UI matches the Matchday Ticket design language.
* The application is deployable without major refactoring.

---

# DEFINITION OF DONE

The project is finished only when:

1. The application runs locally with documented setup.
2. It can be deployed to Vercel (frontend) and Railway/Render (backend).
3. All required integrations are operational or gracefully degraded.
4. Documentation accurately reflects the implementation.
5. The experience feels like a premium production application rather than a prototype.

---
