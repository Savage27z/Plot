import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const ANTHROPIC_MODEL = "claude-sonnet-4-6";
// cheap default; override with OPENROUTER_MODEL in env
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

const DECOMPOSE_SYSTEM = `You are a sharp product strategist. The user describes a decision they are facing. Decompose it into 8-14 cards that physically represent the decision space.

Return STRICT JSON only — no prose, no markdown, no code fences. Output exactly this shape:
[{"id":"c1","type":"stakeholder","title":"...","body":"..."}]

Rules:
- type must be one of: stakeholder, constraint, dependency, evidence, option, risk
- id: short unique slug like "c1".."c14"
- title: max 6 words, punchy, concrete
- body: max 25 words, specific to THIS decision, never generic filler
- Include at least 2 options, at least 1 risk, at least 1 stakeholder
- Infer what the user left unsaid: hidden stakeholders, unstated constraints, evidence they'd need
- Never invent named individuals; use roles`;

const ANALYZE_SYSTEM = `You are a blunt, incisive product strategist standing across a war table from the user. They have arranged decision cards on the table. Reason about what their SPATIAL arrangement reveals — what they've grouped together, what they've exiled to the edges, what they've placed at the center of their thinking, and what that says about their assumptions. Be specific, reference cards by id. Challenge exactly one assumption.

The table is roughly 16 wide (x) by 10 deep (z), centered on (0,0). x is left/right from the user's seat; z is depth — negative z is the far side away from the user, positive z is near them, close to their hands. Never say "top" or "bottom"; speak in table terms: center, edge, far side, close to you, left, right. Distance from origin = distance from the center of their thinking. You will receive computed clusters, isolated cards, and the card nearest the center.

If this is a re-reading (you'll see prior exchanges), acknowledge what moved and what that change means — do not repeat earlier observations.

If the user sends a reply to your question, take it seriously, push back where it's weak, and re-read the table in light of it.

Return STRICT JSON only — no prose, no markdown, no code fences:
{"observations":[{"cardId":"...","text":"..."}],"verdict":"...","question":"..."}

Rules:
- 3-5 observations, each <= 35 words, each tied to a real cardId from the table
- verdict <= 50 words: your blunt overall read of where their head is
- question: exactly one hard, pointed question they are avoiding

Voice rules (strict):
- Speak TO the user: "you", declarative, blunt. You are across the table, not writing a report.
- NEVER write card ids like (c7) in any text field — refer to cards by their short titles in plain speech. Ids belong only in the cardId field.
- Banned words: "suggests", "implies", "indicates", "perhaps", "might", "seems". Say what you see and what it means.
- Don't narrate coordinates. "You shoved your churn data to the far edge" — not "c11 is at position (6.2, -3)".`;

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

// Uses OpenRouter when OPENROUTER_API_KEY is set, otherwise falls back to
// the Anthropic API with ANTHROPIC_API_KEY.
async function callModel(
  system: string,
  messages: AnthropicMessage[]
): Promise<string> {
  const orKey = process.env.OPENROUTER_API_KEY;
  if (orKey) {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${orKey}`,
        "x-title": "Plot - see your decision",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        max_tokens: 2048,
        temperature: 0.8,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`openrouter ${res.status}: ${detail.slice(0, 300)}`);
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("empty completion");
    return text;
  }

  const akKey = process.env.ANTHROPIC_API_KEY;
  if (!akKey) throw new Error("no API key configured");
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": akKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 2048,
      system,
      messages,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`anthropic ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = (data.content ?? [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("");
  if (!text) throw new Error("empty completion");
  return text;
}

// Strip code fences / leading prose and parse the first JSON value found.
function parseLoose(raw: string): unknown {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const start = Math.min(
    ...["[", "{"].map((c) => {
      const i = s.indexOf(c);
      return i === -1 ? Infinity : i;
    })
  );
  if (start === Infinity) throw new Error("no JSON in response");
  const end = Math.max(s.lastIndexOf("]"), s.lastIndexOf("}"));
  return JSON.parse(s.slice(start, end + 1));
}

async function callAndParse(
  system: string,
  messages: AnthropicMessage[]
): Promise<unknown> {
  const first = await callModel(system, messages);
  try {
    return parseLoose(first);
  } catch {
    // One retry, telling the model exactly what went wrong.
    const second = await callModel(system, [
      ...messages,
      { role: "assistant", content: first },
      {
        role: "user",
        content:
          "That was not valid JSON. Return ONLY the JSON value, no fences, no commentary.",
      },
    ]);
    return parseLoose(second);
  }
}

// Models love writing "(c14)" in prose no matter what the prompt says.
// Strip id references from anything the strategist speaks aloud.
function cleanSpeech(text: string): string {
  return text
    .replace(/\s*\(\s*[cu]\d+(\s*(?:,|and|&)\s*[cu]\d+)*\s*\)/gi, "")
    .replace(/\s*\b[cu]\d{1,3}\b['’]s/gi, " its")
    .replace(/(^|\s)[cu]\d{1,3}\b:?\s*/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const CARD_TYPES = new Set([
  "stakeholder",
  "constraint",
  "dependency",
  "evidence",
  "option",
  "risk",
]);

export async function POST(req: NextRequest) {
  if (!process.env.OPENROUTER_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "no API key configured (OPENROUTER_API_KEY or ANTHROPIC_API_KEY)" },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  try {
    if (body.mode === "decompose") {
      const problem = String(body.problem ?? "").trim();
      if (problem.length < 12) {
        return NextResponse.json({ error: "problem too short" }, { status: 400 });
      }
      const parsed = (await callAndParse(DECOMPOSE_SYSTEM, [
        { role: "user", content: problem },
      ])) as any[];
      if (!Array.isArray(parsed)) throw new Error("expected array of cards");
      const cards = parsed
        .filter(
          (c) =>
            c && typeof c.title === "string" && typeof c.body === "string" &&
            CARD_TYPES.has(c.type)
        )
        .slice(0, 14)
        .map((c, i) => ({
          id: typeof c.id === "string" && c.id ? c.id : `c${i + 1}`,
          type: c.type,
          title: String(c.title).slice(0, 60),
          body: String(c.body).slice(0, 200),
        }));
      if (cards.length < 4) throw new Error("too few valid cards");
      return NextResponse.json({ cards });
    }

    if (body.mode === "analyze" || body.mode === "respond") {
      const history: AnthropicMessage[] = Array.isArray(body.history)
        ? body.history
            .filter(
              (t: any) =>
                t && (t.role === "user" || t.role === "assistant") &&
                typeof t.content === "string"
            )
            .slice(-20)
        : [];
      const content = String(body.content ?? "").trim();
      if (!content) {
        return NextResponse.json({ error: "missing content" }, { status: 400 });
      }
      const parsed = (await callAndParse(ANALYZE_SYSTEM, [
        ...history,
        { role: "user", content },
      ])) as any;
      if (
        !parsed ||
        !Array.isArray(parsed.observations) ||
        typeof parsed.verdict !== "string" ||
        typeof parsed.question !== "string"
      ) {
        throw new Error("malformed analysis");
      }
      const observations = parsed.observations
        .filter(
          (o: any) =>
            o && typeof o.cardId === "string" && typeof o.text === "string"
        )
        .slice(0, 5)
        .map((o: any) => ({ cardId: o.cardId, text: cleanSpeech(o.text) }));
      if (!observations.length) throw new Error("no observations");
      return NextResponse.json({
        observations,
        verdict: cleanSpeech(parsed.verdict),
        question: cleanSpeech(parsed.question),
      });
    }

    return NextResponse.json({ error: "unknown mode" }, { status: 400 });
  } catch (err) {
    console.error("[strategist]", err);
    return NextResponse.json(
      { error: "the strategist stepped out" },
      { status: 502 }
    );
  }
}
