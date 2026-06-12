"use client";

import { useEffect, useState } from "react";

export default function MobileGate() {
  const [small, setSmall] = useState(false);

  useEffect(() => {
    const check = () => setSmall(window.innerWidth < 900 || window.innerHeight < 540);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!small) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-char px-10 text-center">
      <h1 className="font-serif text-bone text-6xl">Plot</h1>
      <p className="font-mono smallcaps text-bone-dim mt-3 text-sm">see your decision</p>
      <div className="mt-12 h-px w-16 bg-bone/20" />
      <p className="font-serif italic text-bone/85 mt-12 text-xl leading-relaxed max-w-sm">
        Plot is a desktop experience. A war room needs a table — open this on a larger
        screen.
      </p>
      <p className="font-mono text-[11px] tracking-widest text-bone/25 smallcaps mt-16">
        Built for World Product Day 2026 · #EveryoneShipsNow
      </p>
    </div>
  );
}
