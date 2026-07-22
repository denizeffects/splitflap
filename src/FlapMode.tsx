import { useEffect, useMemo, useRef } from "react";
import {
  SPEEDS,
  easeInQuad,
  easeOutBack,
  easeOutQuad,
  prefersReducedMotion,
  type SplitFlapSpeed,
} from "./config";

/**
 * Flap mode: hinged cards behind a seam. The top half falls under
 * gravity easing, the next glyph's bottom half swings in and lands with
 * a small bounce. One rAF loop drives every cell; panel shading follows
 * the fold angle. Correctness never depends on a frame firing: the
 * final state is committed by the loop and re-checked on each run.
 */

interface Cell {
  stG: HTMLElement;
  sbG: HTMLElement;
  mtG: HTMLElement;
  mbG: HTMLElement;
  mt: HTMLElement;
  mb: HTMLElement;
  stS: HTMLElement;
  mtS: HTMLElement;
  mbS: HTMLElement;
  seq: string[];
  step: number;
  start: number;
  delay: number;
  done: boolean;
  index: number;
}

export function FlapMode({
  text,
  drum,
  speed,
  run,
  initial,
}: {
  text: string;
  drum: string;
  speed: SplitFlapSpeed;
  /** increments to start a run; runs boot from blank when shown is empty */
  run: number;
  /** first-run behavior: animate the boot, settle silently, or hold
      blank cards until the prop flips to "animate" (inview waiting) */
  initial: "animate" | "settle" | "hold";
}) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const shown = useRef<string[]>([]);
  const firstRun = useRef(true);
  const lastRun = useRef(run);

  const chars = useMemo(() => Array.from(text), [text]);
  const L = drum.length;

  useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl) return;

    const cfg = SPEEDS[speed];
    const cellEls = Array.from(
      rootEl.querySelectorAll<HTMLSpanElement>(".sf-cell"),
    );
    const q = (el: HTMLElement, sel: string) =>
      el.querySelector(sel) as HTMLElement;

    // waiting for the viewport: blank cards, no run, nothing consumed
    if (initial === "hold" && firstRun.current) {
      for (const root of cellEls) {
        for (const g of Array.from(root.querySelectorAll("i"))) {
          g.textContent = " ";
        }
        q(root, ".sf-mt").style.transform = "rotateX(-90deg)";
        q(root, ".sf-mb").style.transform = "rotateX(0deg)";
      }
      return;
    }

    const isReplay = run !== lastRun.current;
    lastRun.current = run;
    if (isReplay) shown.current = [];

    const settleOnly =
      (firstRun.current && initial === "settle") || prefersReducedMotion();
    firstRun.current = false;

    const finish = (c: Cell, g: string) => {
      c.stG.textContent = g;
      c.sbG.textContent = g;
      c.mtG.textContent = g;
      c.mbG.textContent = g;
      c.mt.style.transform = "rotateX(-90deg)";
      c.mb.style.transform = "rotateX(0deg)";
      c.stS.style.opacity = "0";
      c.mtS.style.opacity = "0";
      c.mbS.style.opacity = "0";
      c.done = true;
      shown.current[c.index] = g;
    };

    const cells: Cell[] = cellEls.map((root, i) => {
      const raw = chars[i];
      const target = raw;
      /* glyphs outside the drum render statically instead of flipping */
      const inDrum = drum.includes(raw);
      const cur = shown.current[i] ?? " ";
      const c: Cell = {
        stG: q(root, ".sf-st i"),
        sbG: q(root, ".sf-sb i"),
        mtG: q(root, ".sf-mt i"),
        mbG: q(root, ".sf-mb i"),
        mt: q(root, ".sf-mt"),
        mb: q(root, ".sf-mb"),
        stS: q(root, ".sf-sts"),
        mtS: q(root, ".sf-mts"),
        mbS: q(root, ".sf-mbs"),
        seq: [cur],
        step: 0,
        start: 0,
        delay: i * cfg.stagger,
        done: false,
        index: i,
      };

      if (settleOnly || !inDrum || cur === target) {
        finish(c, target);
        return c;
      }

      const ci = drum.indexOf(cur);
      const ti = drum.indexOf(target);
      let dist = (ti - ci + L) % L;
      // booting from blank: approach through the drum from a few glyphs
      // back so every cell flutters instead of jumping straight in
      if (cur === " " && dist > 0) {
        dist = Math.min(dist, 6 + ((Math.random() * 5) | 0));
      }
      for (let s = dist - 1; s >= 0; s--) {
        c.seq.push(drum[(ti - s + L) % L]);
      }

      // idle: statics show the current glyph, movers parked
      c.stG.textContent = cur;
      c.sbG.textContent = cur;
      c.mtG.textContent = cur;
      c.mbG.textContent = cur;
      c.mt.style.transform = "rotateX(-90deg)";
      c.mb.style.transform = "rotateX(0deg)";
      return c;
    });

    if (cells.every((c) => c.done)) return;

    let raf = 0;

    const render = (c: Cell, p: number, isFinal: boolean) => {
      const cur = c.seq[c.step];
      const next = c.seq[c.step + 1];
      c.stG.textContent = next;
      c.sbG.textContent = cur;
      c.mtG.textContent = cur;
      c.mbG.textContent = next;

      if (p < 0.5) {
        const k = easeInQuad(p * 2);
        c.mt.style.transform = `rotateX(${-90 * k}deg)`;
        c.mb.style.transform = "rotateX(90deg)";
        c.mtS.style.opacity = String(0.34 * k);
        c.stS.style.opacity = String(0.2 * Math.sin(Math.PI * k));
        c.mbS.style.opacity = "0.3";
      } else {
        const raw2 = (p - 0.5) * 2;
        const k = isFinal ? easeOutBack(raw2) : easeOutQuad(raw2);
        c.mt.style.transform = "rotateX(-90deg)";
        c.mb.style.transform = `rotateX(${90 * (1 - k)}deg)`;
        c.mtS.style.opacity = "0";
        c.stS.style.opacity = "0";
        c.mbS.style.opacity = String(0.3 * Math.max(0, 1 - k));
      }
    };

    const tick = (now: number) => {
      let alive = false;
      for (const c of cells) {
        if (c.done) continue;
        alive = true;
        if (now < c.start) continue;
        let isFinal = c.step === c.seq.length - 2;
        let dur = isFinal ? cfg.final : cfg.flip;
        let p = (now - c.start) / dur;
        while (p >= 1 && !c.done) {
          c.step++;
          if (c.step >= c.seq.length - 1) {
            finish(c, c.seq[c.seq.length - 1]);
            break;
          }
          c.start += dur;
          isFinal = c.step === c.seq.length - 2;
          dur = isFinal ? cfg.final : cfg.flip;
          p = (now - c.start) / dur;
        }
        if (!c.done) render(c, Math.max(0, Math.min(1, p)), isFinal);
      }
      if (alive) raf = requestAnimationFrame(tick);
    };

    const base = performance.now();
    for (const c of cells) c.start = base + c.delay;
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [chars, drum, L, speed, run, initial]);

  return (
    <span ref={rootRef} className="sf">
      {chars.map((_, i) => (
        <span key={i} className="sf-cell" aria-hidden>
          <span className="sf-half sf-t sf-st">
            <i />
            <b className="sf-shade sf-sts" />
          </span>
          <span className="sf-half sf-b sf-sb">
            <i />
          </span>
          <span className="sf-half sf-t sf-mt">
            <i />
            <b className="sf-shade sf-mts" />
          </span>
          <span className="sf-half sf-b sf-mb">
            <i />
            <b className="sf-shade sf-mbs" />
          </span>
        </span>
      ))}
    </span>
  );
}
