export type SplitFlapMode = "flap" | "roll" | "scramble" | "odometer";
export type SplitFlapSpeed = "calm" | "normal" | "quick";
export type SplitFlapTrigger = "mount" | "inview" | "hover" | "change";

/** Default glyph drum: the ordered ring every cell travels through. */
export const DEFAULT_DRUM = " abcdefghijklmnopqrstuvwxyz0123456789.,!?'-&";

/** Individually tuned speeds, not multipliers of each other. */
export const SPEEDS: Record<
  SplitFlapSpeed,
  { flip: number; final: number; stagger: number; frame: number }
> = {
  calm: { flip: 155, final: 320, stagger: 105, frame: 62 },
  normal: { flip: 98, final: 215, stagger: 62, frame: 50 },
  quick: { flip: 68, final: 165, stagger: 40, frame: 38 },
};

export const easeInQuad = (t: number) => t * t;
export const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
/** Slight overshoot: the landing panel dips past flat and settles. */
export const easeOutBack = (t: number) => {
  const c1 = 1.35;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
