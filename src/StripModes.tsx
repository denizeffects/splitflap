import { useEffect, useState } from "react";
import { prefersReducedMotion, type SplitFlapSpeed } from "./config";

/**
 * Roll and odometer modes: glyph strips sliding inside 1em windows.
 * Once every column lands, the markup swaps to plain static text so
 * nothing rests on a fractional-pixel transform (which would leave
 * subpixel slivers of the previous glyph at fluid font sizes).
 */

const ROLL_TIMING: Record<
  SplitFlapSpeed,
  { base: number; perStep: number; stagger: number }
> = {
  calm: { base: 340, perStep: 82, stagger: 64 },
  normal: { base: 260, perStep: 58, stagger: 46 },
  quick: { base: 190, perStep: 40, stagger: 32 },
};

interface Col {
  glyphs: string[];
  dist: number;
  space: boolean;
}

export function RollMode({
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
  const [cols, setCols] = useState<Col[]>([]);
  const [go, setGo] = useState(false);
  const [settled, setSettled] = useState(true);
  const [first, setFirst] = useState(true);

  const ring = drum.replace(" ", "");
  const timing = ROLL_TIMING[speed];

  useEffect(() => {
    if (first && !animateFirstRun) {
      setFirst(false);
      return;
    }
    setFirst(false);
    if (prefersReducedMotion()) {
      setSettled(true);
      return;
    }
    const next: Col[] = Array.from(text).map((ch) => {
      if (!ring.includes(ch)) {
        return { glyphs: [ch], dist: 0, space: ch === " " };
      }
      const target = ring.indexOf(ch);
      const start = (Math.random() * ring.length) | 0;
      const dist =
        (target - start + ring.length) % ring.length || ring.length;
      const glyphs: string[] = [];
      for (let s = 0; s <= dist; s++) {
        glyphs.push(ring[(start + s) % ring.length]);
      }
      return { glyphs, dist, space: false };
    });
    setSettled(false);
    setGo(false);
    setCols(next);
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setGo(true)),
    );
    const total =
      Math.max(
        0,
        ...next.map(
          (c, i) => timing.base + c.dist * timing.perStep + i * timing.stagger,
        ),
      ) + 140;
    const done = window.setTimeout(() => setSettled(true), total);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, run, speed]);

  if (settled) {
    return (
      <span className="sf-line" aria-hidden>
        {text}
      </span>
    );
  }

  return (
    <span className="sf-line" aria-hidden>
      {cols.map((col, i) =>
        col.space ? (
          <span key={i} className="sf-space" />
        ) : (
          <span key={i} className="sf-win">
            <span
              className="sf-strip"
              style={{
                transform: go ? `translateY(-${col.dist}em)` : "translateY(0)",
                transition: go
                  ? `transform ${timing.base + col.dist * timing.perStep}ms cubic-bezier(0.16,1,0.3,1) ${i * timing.stagger}ms`
                  : "none",
              }}
            >
              {col.glyphs.map((g, s) => (
                <span key={s}>{g}</span>
              ))}
            </span>
          </span>
        ),
      )}
    </span>
  );
}

const ODO_TIMING: Record<SplitFlapSpeed, { dur: number; stagger: number }> = {
  calm: { dur: 1700, stagger: 120 },
  normal: { dur: 1300, stagger: 90 },
  quick: { dur: 900, stagger: 60 },
};

export function OdometerMode({
  text,
  speed,
  run,
  animateFirstRun,
}: {
  text: string;
  speed: SplitFlapSpeed;
  run: number;
  animateFirstRun: boolean;
}) {
  const [spun, setSpun] = useState(false);
  const [settled, setSettled] = useState(true);
  const [first, setFirst] = useState(true);

  const timing = ODO_TIMING[speed];

  useEffect(() => {
    if (first && !animateFirstRun) {
      setFirst(false);
      return;
    }
    setFirst(false);
    if (prefersReducedMotion()) {
      setSettled(true);
      return;
    }
    setSettled(false);
    setSpun(false);
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setSpun(true)),
    );
    const done = window.setTimeout(
      () => setSettled(true),
      timing.dur + text.length * timing.stagger + 140,
    );
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, run, speed]);

  if (settled) {
    return (
      <span className="sf-line" aria-hidden>
        {text}
      </span>
    );
  }

  return (
    <span className="sf-line" aria-hidden>
      {text.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} className="sf-win">
            <span
              className="sf-strip"
              style={{
                transform: spun
                  ? `translateY(-${10 + Number(ch)}em)`
                  : "translateY(0)",
                transition: spun
                  ? `transform ${timing.dur}ms cubic-bezier(0.16,1,0.3,1) ${i * timing.stagger}ms`
                  : "none",
              }}
            >
              {Array.from({ length: 20 }, (_, d) => (
                <span key={d}>{d % 10}</span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </span>
  );
}
