"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/* ————————————————————————————————————————————————
   Plot landing — editorial, analog, in the war-room
   art direction. Eight full sections, smooth reveals.
   ———————————————————————————————————————————————— */

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const rise = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.9, ease },
};

function MonoTag({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p
      className={`font-mono text-[11px] tracking-[0.3em] uppercase ${
        light ? "text-char/55" : "text-bone/40"
      }`}
    >
      {children}
    </p>
  );
}

/* —— floating mini decision card used in the hero —— */
function FloatCard({
  type,
  title,
  color,
  className,
  delay = 0,
  rotate = 0,
}: {
  type: string;
  title: string;
  color: string;
  className: string;
  delay?: number;
  rotate?: number;
}) {
  return (
    <motion.div
      className={`absolute hidden lg:block ${className}`}
      initial={{ opacity: 0, y: 26, rotate }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 1.1, delay: 0.6 + delay, ease }}
    >
      <motion.div
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 5.5 + delay * 2, repeat: Infinity, ease: "easeInOut", delay }}
        className="w-[150px] border border-char/10 bg-[#ded5c2] px-3.5 py-3 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.65)]"
      >
        <div className="mb-1.5 h-[3px] w-full" style={{ background: color }} />
        <p className="font-mono text-[8px] tracking-[0.22em] uppercase text-char/50">{type}</p>
        <p className="font-serif text-[15px] leading-tight text-char">{title}</p>
      </motion.div>
    </motion.div>
  );
}

/* —— 01 · hero —— */
function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-char">
      {/* top bar */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-baseline gap-4">
          <span className="font-serif text-3xl text-bone">Plot</span>
          <span className="hidden font-mono text-[10px] tracking-[0.3em] uppercase text-bone/35 sm:block">
            decision war room
          </span>
        </div>
        <nav className="flex items-center gap-3">
          <a
            href="#how"
            className="hidden border border-bone/15 px-4 py-2 font-mono text-[10px] tracking-[0.25em] uppercase text-bone/60 transition-colors duration-300 hover:border-bone/40 hover:text-bone md:block"
          >
            how it works
          </a>
          <a
            href="#mechanic"
            className="hidden border border-bone/15 px-4 py-2 font-mono text-[10px] tracking-[0.25em] uppercase text-bone/60 transition-colors duration-300 hover:border-bone/40 hover:text-bone md:block"
          >
            the mechanic
          </a>
          <Link
            href="/room"
            className="border border-ember/60 bg-ember/10 px-5 py-2 font-mono text-[10px] tracking-[0.25em] uppercase text-ember transition-colors duration-300 hover:bg-ember hover:text-char"
          >
            enter the war room
          </Link>
        </nav>
      </header>

      {/* scattered cards */}
      <FloatCard type="stakeholder" title="Enterprise design partner" color="#6b7d4f" className="left-[7%] top-[22%]" rotate={-5} />
      <FloatCard type="risk" title="Team split on scope" color="#a85b3c" className="left-[14%] top-[62%]" delay={0.3} rotate={3} />
      <FloatCard type="evidence" title="Beta churn at 40%" color="#b3a06e" className="left-[26%] top-[14%]" delay={0.15} rotate={6} />
      <FloatCard type="option" title="Ship in six weeks" color="#c8bfa8" className="right-[24%] top-[16%]" delay={0.45} rotate={-4} />
      <FloatCard type="constraint" title="Runway to the conference" color="#5d6b75" className="right-[8%] top-[30%]" delay={0.2} rotate={5} />
      <FloatCard type="dependency" title="Billing migration first" color="#8a6a5c" className="right-[13%] top-[66%]" delay={0.55} rotate={-6} />

      {/* headline */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.p
          className="font-mono text-[11px] tracking-[0.35em] uppercase text-ember"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          a war room for product decisions
        </motion.p>
        <motion.h1
          className="mt-6 font-serif text-bone"
          style={{ fontSize: "clamp(56px, 10vw, 150px)", lineHeight: 0.98 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.35, ease }}
        >
          See your <em className="text-ember">decision.</em>
        </motion.h1>
        <motion.p
          className="mt-8 max-w-xl font-serif text-lg leading-relaxed text-bone/60 md:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
        >
          Type the decision you&apos;re wrestling with. An AI strategist breaks it into
          physical cards on a 3D table — then reads how you arrange them.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.05, ease }}
        >
          <Link
            href="/room"
            className="mt-10 inline-block border border-bone/30 px-10 py-4 font-mono text-xs tracking-[0.3em] uppercase text-bone transition-all duration-300 hover:border-ember hover:text-ember"
          >
            lay it on the table →
          </Link>
        </motion.div>
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 pb-6 md:px-12">
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-bone/25">
          built for world product day 2026
        </p>
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-bone/25">scroll ↓</p>
      </div>
    </section>
  );
}

/* —— 02 · manifesto —— */
function Manifesto() {
  const lines = [
    <>TYPED <em className="text-ember">fast,</em></>,
    <>ARGUED <em className="text-ember">loud,</em></>,
    <>DECIDED <span className="text-bone/35">NEVER.</span></>,
    <span key="4" className="text-bone/25">
      DECISIONS DESERVE <em className="text-ember/50">a table.</em>
    </span>,
  ];
  return (
    <section className="relative bg-[#10120b] px-6 py-36 md:py-44">
      <div className="mx-auto max-w-5xl text-center">
        <motion.div {...rise}>
          <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-bone/35">
            — our manifesto · 01 —
          </p>
        </motion.div>
        <div className="mt-12 space-y-2">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              className="font-serif text-bone"
              style={{ fontSize: "clamp(36px, 6vw, 84px)", lineHeight: 1.05 }}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, delay: i * 0.16, ease }}
            >
              {line}
            </motion.p>
          ))}
        </div>
        <motion.p {...rise} className="mx-auto mt-14 max-w-2xl font-serif text-lg italic leading-relaxed text-bone/55">
          Every hard product decision dies in a doc nobody re-reads. Plot turns it into a
          room you can stand in — stakeholders, constraints, evidence, options and risks,
          laid out as cards under one warm light.
        </motion.p>
      </div>
    </section>
  );
}

/* —— 03 · how it works —— */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Lay it on the table",
      body: "Describe the decision you're facing in plain words. The strategist decomposes it into 8–14 cards — stakeholders, constraints, dependencies, evidence, options, risks — and drops them onto the table.",
    },
    {
      n: "02",
      title: "Arrange your thinking",
      body: "Drag the cards. Cluster what belongs together. Push what you'd rather ignore to the edge. Put the thing this is really about at the center. You'll do it without noticing.",
    },
    {
      n: "03",
      title: "Let it read the table",
      body: "Hold the button. The strategist reads your arrangement — what you grouped, what you exiled, what sits at the center — and tells you what that says about your assumptions. Out loud. Card by card.",
    },
  ];
  return (
    <section id="how" className="bg-bone px-6 py-28 text-char md:px-12 md:py-36">
      <div className="mx-auto max-w-6xl">
        <motion.div {...rise} className="flex items-end justify-between border-b border-char/15 pb-8">
          <h2 className="font-serif" style={{ fontSize: "clamp(40px, 5.5vw, 80px)", lineHeight: 1 }}>
            How it works
          </h2>
          <MonoTag light>three moves · five minutes</MonoTag>
        </motion.div>
        <div className="mt-16 grid gap-14 md:grid-cols-3 md:gap-10">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.85, delay: i * 0.15, ease }}
            >
              <p className="font-mono text-5xl text-ember">{s.n}</p>
              <h3 className="mt-5 font-serif text-3xl">{s.title}</h3>
              <p className="mt-4 font-mono text-[13px] leading-relaxed text-char/65">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* —— 04 · the mechanic (ember block) —— */
function Mechanic() {
  return (
    <section id="mechanic" className="bg-ember px-6 py-28 text-char md:px-12 md:py-40">
      <div className="mx-auto max-w-6xl">
        <motion.div {...rise}>
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-char/60">
            the mechanic — why this isn&apos;t a chatbot
          </p>
        </motion.div>
        <motion.h2
          {...rise}
          className="mt-8 font-serif"
          style={{ fontSize: "clamp(44px, 7.5vw, 110px)", lineHeight: 0.98 }}
        >
          Where you put the cards <em>is</em> the conversation.
        </motion.h2>
        <div className="mt-14 grid gap-10 font-mono text-[13px] leading-relaxed text-char/75 md:grid-cols-3">
          {[
            ["CLUSTERED", "Cards you group together reveal the trade-off you're actually weighing — even when you'd describe it differently out loud."],
            ["EXILED", "The card you slid to the far corner is usually the one the whole decision hinges on. The strategist will go get it."],
            ["CENTERED", "Whatever sits nearest the middle of the table is the center of your thinking. Sometimes that's the problem."],
          ].map(([k, v], i) => (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.12, ease }}
              className="border-t-2 border-char/30 pt-5"
            >
              <p className="tracking-[0.3em]">{k}</p>
              <p className="mt-3 text-char/70">{v}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* —— 05 · the strategist —— */
function Strategist() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const glow = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.6]);

  return (
    <section id="strategist" ref={ref} className="relative overflow-hidden bg-char px-6 py-32 md:py-44">
      {/* the orb */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <motion.div style={{ opacity: glow }}>
          <motion.div
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="h-[340px] w-[340px] -translate-y-1/3 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,107,53,0.85) 0%, rgba(255,107,53,0.25) 32%, rgba(255,107,53,0.06) 55%, transparent 72%)",
            }}
          />
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-4xl pt-28 text-center">
        <motion.div {...rise}>
          <MonoTag>the strategist · it does not flatter</MonoTag>
        </motion.div>
        <motion.h2
          {...rise}
          className="mt-8 font-serif text-bone"
          style={{ fontSize: "clamp(40px, 5.5vw, 76px)", lineHeight: 1.02 }}
        >
          A blunt voice across the table.
        </motion.h2>
        <motion.p {...rise} className="mx-auto mt-8 max-w-2xl font-serif text-lg leading-relaxed text-bone/60">
          It speaks one observation at a time, pointing a beam of light at the card it
          means. Then a verdict. Then the one question you&apos;ve been avoiding.
        </motion.p>

        <motion.blockquote
          {...rise}
          className="relative mx-auto mt-16 max-w-2xl border-t border-bone/15 px-8 pt-10"
        >
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-ember">
            observation · 2 of 4 · re: beta churn
          </p>
          <p className="mt-5 font-serif text-2xl italic leading-snug text-bone md:text-3xl">
            &ldquo;You parked your churn evidence at the edge of the table. Forty percent of
            users never reach value, and you&apos;re treating it as background noise.&rdquo;
            <span className="cursor-blink text-ember"> ▌</span>
          </p>
        </motion.blockquote>
      </div>
    </section>
  );
}

/* —— 06 · the memo —— */
function Memo() {
  return (
    <section id="memo" className="bg-bone px-6 py-28 text-char md:px-12 md:py-36">
      <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
        <motion.div {...rise}>
          <MonoTag light>the artifact</MonoTag>
          <h2 className="mt-6 font-serif" style={{ fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 1 }}>
            Leave with the memo.
          </h2>
          <p className="mt-7 max-w-md font-mono text-[13px] leading-relaxed text-char/65">
            One click exports the whole session as a clean markdown decision memo — the
            problem, every card, the strategist&apos;s observations, the verdict, the open
            question, and your answers. Paste it into the doc. Bring it to the meeting.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: 1.5 }}
          whileInView={{ opacity: 1, y: 0, rotate: 1.5 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease }}
          className="border border-char/15 bg-[#f4efe3] p-8 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.45)]"
        >
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-char/40">
            plot-memo.md
          </p>
          <div className="mt-5 space-y-3 font-mono text-[12px] leading-relaxed text-char/80">
            <p className="text-base font-medium text-char"># Decision Memo — Plot</p>
            <p>## The decision</p>
            <p className="text-char/60">We need to ship in 6 weeks but the team is split on scope…</p>
            <p>## The strategist&apos;s reading</p>
            <p className="text-char/60">- <em>Team split on scope</em> — it is not a risk card. It is the decision itself…</p>
            <p><span className="font-medium">**Verdict.**</span> <span className="text-char/60">You arranged this as a calendar problem. It is a conviction problem.</span></p>
            <p><span className="font-medium">**Open question.**</span> <span className="text-ember">If the conference vanished tomorrow, would you still ship in six weeks?</span></p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* —— 07 · notes from the table —— */
function Notes() {
  const notes = [
    ["You grouped both options with the CEO demo. The users aren't in that cluster.", "verdict · n° 0042"],
    ["The dependency you exiled to the corner has a longer lead time than your entire runway.", "observation · n° 0117"],
    ["Nothing sits at the center of your table. That is the most honest thing on it.", "verdict · n° 0009"],
    ["You moved the churn card closer this time. What changed since the last reading?", "re-reading · n° 0058"],
    ["Whose renewal are you actually protecting — the partner's, or your own conviction?", "question · n° 0031"],
  ];
  const tilts = [-3, 2.5, -1.5, 3.5, -2.5];
  return (
    <section id="notes" className="bg-[#b9b49b] px-6 py-28 text-char md:px-12 md:py-36">
      <div className="mx-auto max-w-6xl">
        <motion.div {...rise}>
          <h2 className="font-serif italic" style={{ fontSize: "clamp(44px, 6vw, 88px)", lineHeight: 0.95 }}>
            Notes
          </h2>
          <h2 className="font-serif" style={{ fontSize: "clamp(34px, 4.2vw, 60px)", lineHeight: 1.05 }}>
            from the table
          </h2>
          <p className="mt-4 font-mono text-[10px] tracking-[0.3em] uppercase text-char/50">
            things the strategist has actually said
          </p>
        </motion.div>
        <div className="mt-16 flex flex-wrap justify-center gap-7">
          {notes.map(([q, tag], i) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, y: 30, rotate: tilts[i] }}
              whileInView={{ opacity: 1, y: 0, rotate: tilts[i] }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.85, delay: i * 0.1, ease }}
              whileHover={{ rotate: 0, y: -6 }}
              className="w-[270px] border border-char/10 bg-[#efe9da] px-6 py-6 shadow-[0_22px_45px_-22px_rgba(0,0,0,0.5)]"
            >
              <p className="font-serif text-[17px] italic leading-snug">&ldquo;{q}&rdquo;</p>
              <p className="mt-5 font-mono text-[9px] tracking-[0.25em] uppercase text-char/45">{tag}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* —— 08 · final CTA + footer —— */
function FinalCta() {
  return (
    <section id="cta" className="relative flex min-h-[85vh] flex-col bg-char px-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <motion.div {...rise}>
          <MonoTag>no sign-up · one decision · five minutes</MonoTag>
        </motion.div>
        <motion.h2
          {...rise}
          className="mt-8 font-serif text-bone"
          style={{ fontSize: "clamp(48px, 9vw, 130px)", lineHeight: 0.98 }}
        >
          The table is <em className="text-ember">set.</em>
        </motion.h2>
        <motion.div {...rise}>
          <Link
            href="/room"
            className="mt-12 inline-block border border-ember bg-ember px-12 py-5 font-mono text-sm tracking-[0.3em] uppercase text-char transition-all duration-300 hover:bg-transparent hover:text-ember"
          >
            enter the war room
          </Link>
        </motion.div>
      </div>
      <footer className="flex flex-col items-center gap-2 border-t border-bone/10 py-8 md:flex-row md:justify-between">
        <p className="font-serif text-xl text-bone/70">Plot</p>
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-bone/30">
          Plot — see your decision · Built for World Product Day 2026 · #EveryoneShipsNow
        </p>
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-bone/30">
          best experienced on desktop
        </p>
      </footer>
    </section>
  );
}

export default function LandingPage() {
  return (
    <main className="grain bg-char">
      <Hero />
      <Manifesto />
      <HowItWorks />
      <Mechanic />
      <Strategist />
      <Memo />
      <Notes />
      <FinalCta />
    </main>
  );
}
