# MatchDayAI_Master_Prompt.md

## Part 3 — Premium UI/UX Design System, Component Library, User Experience & Interaction Specifications

---

# DESIGN MISSION

The application must not look like a generic AI chatbot.

It must feel like a **premium digital match ticket** that evolves throughout the fan's journey.

The visual identity should combine:

* Vintage football match programs
* Premium printed tickets
* FIFA event branding quality
* Modern SaaS usability
* Apple-level polish
* Stripe-level consistency
* Linear-level animations

The experience should feel warm, tactile, trustworthy, and celebratory.

---

# DESIGN PHILOSOPHY

Every screen should answer three questions immediately:

1. Where am I in my matchday?
2. What should I do next?
3. What is happening around me?

Information should be prioritized over decoration.

The interface should feel calm even when conditions are busy.

---

# VISUAL IDENTITY

Avoid:

* Dark mode
* Cyberpunk
* Neon gradients
* Heavy glassmorphism
* Busy dashboards
* AI chat layouts
* Dense tables
* Generic admin interfaces

Instead embrace:

* Warm paper textures
* Ticket stubs
* Stadium program layouts
* Printed typography
* Vintage sports aesthetics
* Elegant whitespace
* Minimal shadows
* Editorial design

---

# COLOR SYSTEM

## Paper Background

```text
#F7F2E7
```

## Card Surface

```text
#FFFFFF
```

## Primary Ink

```text
#1A1A1A
```

## Matchday Red

```text
#B3272C
```

Use for:

* Alerts
* Important buttons
* Live indicators
* AI highlights

---

## Gold Accent

```text
#C89B3C
```

Use sparingly.

Only for:

* Premium highlights
* Ticket borders
* Success moments
* Achievement states

---

## Calm Green

```text
#2F6E4F
```

Use for:

* Normal conditions
* Accessible routes
* Clear congestion
* Successful actions

---

## Neutral Text

```text
#6B6255
```

Secondary labels only.

---

# TYPOGRAPHY

Display

Bebas Neue

or

Oswald

Use only for:

* Match phase
* Stadium title
* Major statistics

Body

Inter

or

Source Sans 3

Use throughout.

Numbers

JetBrains Mono

Only for:

* Queue times
* Weather values
* Live timestamps
* Transit countdowns

---

# DESIGN TOKENS

Create CSS variables.

Example:

```css
--color-paper
--color-card
--color-primary
--color-accent
--radius-card
--radius-button
--space-xs
--space-sm
--space-md
--space-lg
--space-xl
--shadow-soft
--transition-fast
--transition-normal
```

Never hardcode colors inside components.

---

# SPACING SYSTEM

Use an 8-point grid.

Spacing:

4

8

12

16

24

32

48

64

80

96

Maintain consistent rhythm throughout.

---

# BORDER RADIUS

Cards

16px

Buttons

12px

Inputs

12px

Badges

999px

Avoid inconsistent rounding.

---

# ELEVATION

Minimal shadows.

Prefer borders.

Cards should feel printed rather than floating.

---

# MOTION DESIGN

Use Framer Motion.

Animations should be subtle.

Examples:

Card reveal

Fade

Slide

Scale

Number count-up

Queue updates

Phase transitions

Voice pulse

Avoid flashy effects.

Target 60 FPS.

---

# APPLICATION LAYOUT

Desktop

```text
---------------------------------------
Header

Phase Stamp

Weather

Language

Accessibility

---------------------------------------

AI Concierge

---------------------------------------

Map

Zone Status

---------------------------------------

Quick Actions

Crowd Reports

---------------------------------------

Footer
```

---

Mobile

Single column.

Sticky AI concierge.

Large touch targets.

Bottom quick action bar.

Voice button always visible.

---

# GLOBAL HEADER

Contains:

MatchDay AI logo

Current phase stamp

Live data badge

Weather summary

Language selector

Accessibility toggle

Voice status

---

# PHASE STAMP

The phase indicator should resemble a passport validation stamp.

Examples:

PRE MATCH

LIVE MATCH

POST MATCH

Rotate slightly.

Use distressed border styling.

Always visible.

---

# AI CONCIERGE CARD

The centerpiece of the application.

Never resemble a messaging app.

Instead:

Printed information card

Circular stadium seal

Official-looking stamp

Ticket border

AI badge

Timestamp

Voice playback button

Response source

OpenRouter model name

---

# QUICK ACTIONS

Each phase has dedicated quick actions.

Pre Match

Find Parking

Find Gate

Security Wait

Weather

Find Seat

Live

Food

Restroom

Accessibility

Queue

Halftime

Post

Exit Plan

Train

Parking

Ride Share

Walking Route

---

# MAP EXPERIENCE

Map occupies a large portion of the screen.

Display:

Current stadium

Zones

Congestion overlay

Walking route

Accessible route

Selected destination

Animated route drawing

Live legend

---

# ZONE CARDS

Each zone card contains:

Zone name

Congestion

Report count

Recommendation

Status badge

Estimated wait

Trend indicator

Map shortcut

Crowd reporting buttons

---

# CROWD REPORT BUTTONS

Three large buttons.

🔴 Crowded

🟢 Clear

🟠 Long Line

Optimistically update UI.

Display confirmation animation.

---

# WEATHER CARD

Compact.

Displays:

Temperature

Rain probability

Wind

Humidity

Update time

Source badge

---

# MATCH STATUS CARD

Displays:

Teams

Score

Minute

Kickoff

Competition

Venue

Status

Source badge

---

# EXIT PLAN CARD

Looks like a printed travel itinerary.

Includes:

Recommended gate

Walking distance

Estimated time

Transit

Warnings

Accessibility notes

Alternative route

Confidence level

---

# LOST PERSON FLOW

Wizard style.

Step 1

Details

↓

Step 2

Preview

↓

Step 3

Generate Announcement

↓

Step 4

Dispatch Summary

Display multilingual output in formatted cards.

---

# REPORT SIGHTING

Minimal interface.

One text box.

Zone selector.

Submit.

Display AI similarity confidence.

---

# ACCESSIBILITY MODE

Large toggle.

When enabled:

Accessible routes

Elevator guidance

Step-free paths

Alternative exits

Voice confirmation

Persistent across sessions.

---

# LANGUAGE SWITCHER

Styled as passport flag tabs.

Supported:

🇺🇸 English

🇪🇸 Español

🇮🇳 हिन्दी

Changes:

UI

Voice

AI prompts

Lost & Found

Announcements

---

# LOADING STATES

Never use blank spinners.

Use skeletons.

Ticket placeholders.

Animated placeholders.

Estimated update time.

---

# EMPTY STATES

Friendly.

Helpful.

Suggest actions.

Never simply say:

"No data."

---

# ERROR STATES

Explain:

What happened

What still works

What fallback is active

Next recommended action

---

# TOASTS

Use shadcn/ui.

Examples:

Crowd report submitted

Voice connected

Exit plan updated

Weather refreshed

Language changed

---

# MICROINTERACTIONS

Animate:

Button presses

Card expansion

Queue changes

Weather updates

Voice activation

AI thinking

Map routing

Success confirmations

---

# RESPONSIVE REQUIREMENTS

Support:

320px

375px

390px

768px

1024px

1440px

Ultra-wide

No horizontal scrolling.

---

# COMPONENT LIBRARY

Create reusable components.

Examples:

AppHeader

PhaseStamp

TicketCard

StampedResponse

VoiceButton

WeatherCard

MatchCard

ZoneCard

MapPanel

CrowdReportPanel

ExitPlanCard

AccessibilityToggle

LanguageSelector

QuickActionGrid

LoadingSkeleton

StatusBadge

DeveloperPanel

Each component has:

Strong typing

Accessibility

Documentation

Unit tests

---

# DESIGN CONSISTENCY RULES

Every new component must:

Use design tokens

Support animations

Support loading state

Support error state

Support responsive layouts

Support accessibility

Avoid duplicated styles

---

# USER JOURNEY

## Arrival

Open app

↓

Detect phase

↓

Show weather

↓

Show gate

↓

Ask AI

↓

Navigate

↓

Report congestion

---

## Match

Receive recommendations

↓

Voice question

↓

Find food

↓

Find restroom

↓

Watch match

↓

Receive alerts

---

## Exit

Generate exit plan

↓

Choose transport

↓

Follow map

↓

Receive updates

↓

Leave stadium efficiently

---

# QUALITY CHECKLIST

Before implementation of any screen verify:

✓ Matches ticket aesthetic

✓ Accessible

✓ Responsive

✓ Uses design tokens

✓ Uses reusable components

✓ Has loading state

✓ Has error state

✓ Has animation

✓ Works on touch devices

✓ Feels premium

---

# END OF PART 3

**Next:** **Part 4 — Backend APIs, State Management, Data Models, AI Prompt Orchestration, OpenRouter Request Pipeline, Vapi Event Handling, and Complete Feature Specifications.**
