"use client";

import { useEffect, useRef, useState } from "react";

// Word-by-word reveal with a blinking block cursor.
export default function Typewriter({
  text,
  speed = 75,
  onDone,
  className,
}: {
  text: string;
  speed?: number;
  onDone?: () => void;
  className?: string;
}) {
  const words = text.split(/\s+/);
  const total = words.length;
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    setCount(0);
    doneRef.current = false;
    const id = setInterval(() => {
      setCount((c) => (c >= total ? c : c + 1));
    }, speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // completion is reported from an effect, never from inside the state updater
  useEffect(() => {
    if (count >= total && total > 0 && !doneRef.current) {
      doneRef.current = true;
      onDone?.();
    }
  }, [count, total, onDone]);

  return (
    <span className={className}>
      {words.slice(0, count).join(" ")}
      <span className="cursor-blink text-ember"> ▌</span>
    </span>
  );
}
