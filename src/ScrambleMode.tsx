import { useEffect, useState } from "react";
import {
  SPEEDS,
  prefersReducedMotion,
  type SplitFlapSpeed,
} from "./config";

/** Scramble mode: glyphs flicker through the drum and settle left to
    right, like a terminal finding its words. */
export function ScrambleMode({
  text,
  drum,
  speed,
  run,
  animateFirstRun,
}: {
  text: string;
  drum: string;
  speed: SplitFlapSpeed;
  run: number;
  animateFirstRun: boolean;
}) {
  const [display, setDisplay] = useState(text);
  const [first, setFirst] = useState(true);

  const ring = drum.replace(" ", "");

  useEffect(() => {
    if (first && !animateFirstRun) {
      setFirst(false);
      setDisplay(text);
      return;
    }
    setFirst(false);
    if (prefersReducedMotion()) {
      setDisplay(text);
      return;
    }
    const total = 18;
    const frameMs = SPEEDS[speed].frame;
    let frame = 0;
    const id = window.setInterval(() => {
      frame++;
      const settledCount = Math.floor((frame / total) * text.length);
      setDisplay(
        Array.from(text)
          .map((c, i) =>
            i < settledCount || !ring.includes(c)
              ? c
              : ring[(Math.random() * ring.length) | 0],
          )
          .join(""),
      );
      if (frame >= total) {
        window.clearInterval(id);
        setDisplay(text);
      }
    }, frameMs);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, run, speed]);

  return (
    <span className="sf-line" aria-hidden>
      {display || " "}
    </span>
  );
}
