# Plot — see your decision

**A cinematic 3D war room where product decisions become physical.**

Plot turns the messy, circular arguments inside product teams into something you can see and touch. You describe the decision you're wrestling with. An AI strategist breaks it into 8–14 physical cards — stakeholders, constraints, dependencies, evidence, options, risks — and drops them onto a 3D war-room table under a single warm lamp.

Then you drag the cards. You cluster what belongs together. You push what you'd rather ignore to the edge. You put the thing this is really about at the center.

Then the strategist reads the table.

It looks at what you grouped, what you exiled, what sits at the center of your thinking — and tells you what that arrangement reveals about your assumptions. Card by card. A beam of light tracks from the strategist's orb to each card as it speaks. Then a verdict. Then the one question you've been avoiding.

**The core mechanic:** your spatial arrangement is itself the input. Where you put the cards *is* the conversation.

> **Live:** [plot-cyan.vercel.app](https://plot-cyan.vercel.app)

---

## How it works

### 1. Lay it on the table
Type the decision you're facing, or pick one of the cold-start examples. The strategist decomposes it into cards and scatters them across the table.

### 2. Arrange your thinking
Drag cards to cluster, exile, or center them. Add your own cards if the strategist missed something. Click any card to inspect it full-size.

### 3. Read the table
Hold the "read the table" button. The strategist analyzes your spatial layout — computed clusters, isolated cards, what's nearest the center — and delivers blunt, card-by-card observations with a beam of light tracking each one.

### 4. Respond and re-read
The strategist ends with a pointed question. Answer it, rearrange the table, and request another reading. It tracks what moved between readings and calls out what changed (and what didn't).

### 5. Export the memo
One click downloads a clean markdown decision memo — the problem, every card, the strategist's observations, the verdict, the open question, and your answers. Paste it in the doc. Bring it to the meeting.

---

## The mechanic — why this isn't a chatbot

| Pattern | What it reveals |
|---|---|
| **Clustered** | Cards grouped together reveal the trade-off you're actually weighing — even when you'd describe it differently out loud. |
| **Exiled** | The card you slid to the far corner is usually the one the whole decision hinges on. The strategist will go get it. |
| **Centered** | Whatever sits nearest the middle of the table is the center of your thinking. Sometimes that's the problem. |
| **Moved** | Between readings, the strategist tracks which cards you shifted and in which direction — toward the center, out to the edge, or across the table. |

---

## Features

- **3D war-room scene** — table, lamp, dust particles, strategist orb, directional lighting, fog
- **Spring-physics cards** — bouncy spawn drop, hover lift, drag tilt, natural skew per card
- **Beam of light** — quadratic bezier curve from orb to active card with shimmer and spotlight iris
- **Spatial analysis** — union-find clustering, isolated card detection, center-of-table reasoning
- **Movement diffing** — tracks card positions between readings and reports what moved
- **Card inspect** — click any card for a full-size overlay
- **Add your own cards** — 6 card types, dealt to the table edge
- **Share table** — base64url-encoded table state in the URL hash, shareable with one click
- **Export memo** — markdown decision memo downloaded + copied to clipboard
- **Synthesized audio** — brown noise ambience, card slide sounds, dual-oscillator orb hum (off by default)
- **Cinematic camera** — dolly-in on card spawn, orbit controls for free look
- **Rotating thinking lines** — cycling status messages during the strategist's analysis
- **Mobile landing page** — full editorial landing with 8 sections, responsive down to 375px
- **OG image** — auto-generated 1200x630 preview card for social sharing

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| 3D | react-three-fiber + drei |
| Animation | framer-motion (overlays), useFrame springs (cards) |
| Styling | Tailwind CSS |
| State | Zustand |
| AI | OpenRouter API (default: Gemini 2.5 Flash) with Anthropic fallback |
| Audio | WebAudio API (all synthesized, no audio files) |
| Analytics | Novus / Pendo |
| Deploy | Vercel |

---

## Art direction

Charcoal background (`#0c0b09`), bone text (`#e8e2d4`), ember accent (`#ff6b35`) reserved for the strategist only. Muted analog card colors — olive, slate, clay, sand, pale bone, rust. Instrument Serif for headlines, IBM Plex Mono for UI.

**Banned:** purple gradients, glassmorphism, emoji, gradient text, rounded-2xl, floating blobs.

---

## Run locally

```bash
git clone https://github.com/Savage27z/Plot.git
cd Plot
npm install
cp .env.example .env.local
```

Add your API key to `.env.local`:

```env
# Option A: OpenRouter (recommended — cheap, fast)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=google/gemini-2.5-flash

# Option B: Anthropic (higher quality, higher cost)
ANTHROPIC_API_KEY=sk-ant-...
```

Then:

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000). The war room is at [localhost:3000/room](http://localhost:3000/room).

---

## Deploy to Vercel

The repo auto-deploys via GitHub integration. Set these env vars in your Vercel project settings:

| Variable | Value |
|---|---|
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `OPENROUTER_MODEL` | `google/gemini-2.5-flash` (or any OpenAI-compatible model) |

Or use `ANTHROPIC_API_KEY` instead for the Anthropic backend.

---

## Project structure

```
app/
  api/strategist/route.ts   — AI backend (decompose, analyze, respond)
  opengraph-image.tsx        — Auto-generated OG image
  layout.tsx                 — Root layout + Novus snippet
  page.tsx                   — Landing page
  room/page.tsx              — War room entry

components/
  PlotApp.tsx                — Main orchestrator (phases, API calls, table description)
  scene/
    Scene.tsx                — R3F Canvas, lights, controls
    CardMesh.tsx             — Individual card with spring physics
    Orb.tsx                  — Strategist orb with breathing glow
    Beam.tsx                 — Light beam from orb to active card
    Atmosphere.tsx           — Dust, lamp, chair
    CameraDolly.tsx          — Cinematic camera on card spawn
    live.ts                  — Mutable world positions (no React renders)
  overlay/
    Landing.tsx              — Decision input + example chips
    Dialogue.tsx             — Observation playback + respond input
    CardInspect.tsx          — Full-size card overlay
    AddCard.tsx              — Add custom card modal
    HudFrame.tsx             — Wordmark, sound toggle, share, export, legend
    ReadTableButton.tsx      — Hold-to-confirm + rotating thinking lines
    Typewriter.tsx           — Word-by-word text reveal
  landing/
    LandingPage.tsx          — 8-section editorial landing page

lib/
  store.ts                   — Zustand store (phases, cards, positions, analyses)
  types.ts                   — TypeScript types
  clustering.ts              — Union-find spatial clustering
  share.ts                   — Base64url table encoding/decoding
  memo.ts                    — Markdown memo builder
  audio.ts                   — WebAudio synthesized sounds
  analytics.ts               — Novus/Pendo event wrapper
```

---

## Hackathon

Built for **Mind the Product — World Product Day: Everyone Ships Now** (June 20, 2026).

The premise: product decisions don't die from lack of data. They die from lack of *arrangement*. PMs have all the inputs — they just can't see how they've weighted them. Plot makes the weighting visible by turning it into a physical act.

---

*Plot — see your decision.*
