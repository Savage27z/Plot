# Plot — see your decision

A cinematic 3D decision war-room for product managers. Describe the decision you're
facing; an AI strategist decomposes it into physical cards — stakeholders, constraints,
dependencies, evidence, options, risks — that drop onto a war-room table. Drag the cards
to arrange your thinking, then have the strategist **read the table**: it reasons about
your spatial arrangement — what you clustered, what you exiled to the edges, what sits at
the center — and challenges your assumptions, pointing a beam of light at each card as it
speaks. Export the whole reading as a markdown decision memo.

**The mechanic:** your spatial arrangement is itself input to the AI's reasoning.

Built for the Mind the Product **World Product Day: Everyone Ships Now** hackathon.

## Stack

- Next.js 14 (App Router, TypeScript)
- react-three-fiber + drei for the 3D scene
- framer-motion + Tailwind for overlays
- Anthropic Messages API (`claude-sonnet-4-6`) via a server route — the key never
  reaches the client

## Run it

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Deploys to Vercel as-is; set `ANTHROPIC_API_KEY` in project env vars.

## Analytics

`app/layout.tsx` has a marked slot for the Novus/Pendo snippet. Event calls
(`problem_submitted`, `card_dragged`, `table_read`, `memo_exported`, `response_sent`)
are wired in `lib/analytics.ts` and are safe no-ops until the snippet is installed.
