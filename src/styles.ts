/**
 * Component styles, injected once at first mount. Everything is scoped
 * under `sf-` and sized in em so the host's font-size controls scale.
 * Theming happens through CSS custom properties:
 *
 *   --sf-card        card background        (default: faint neutral)
 *   --sf-card-border card + seam hairline   (default: faint neutral)
 *   --sf-ink         glyph color            (default: currentColor)
 *   --sf-radius      card corner radius     (default: 0.07em)
 */

export const CSS = `
.sf-host {
  display: inline-flex;
  align-items: baseline;
}
.sf-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
.sf {
  display: inline-flex;
  gap: 0.08em;
  font-variant-numeric: tabular-nums;
}
.sf-cell {
  position: relative;
  width: 0.76em;
  height: 1.16em;
  border-radius: var(--sf-radius, 0.07em);
  background: var(--sf-card, color-mix(in srgb, currentColor 5%, transparent));
  border: 1px solid var(--sf-card-border, color-mix(in srgb, currentColor 14%, transparent));
  perspective: 2.6em;
  color: var(--sf-ink, currentColor);
}
.sf-cell::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: calc(50% - 0.5px);
  height: 1px;
  background: var(--sf-card-border, color-mix(in srgb, currentColor 14%, transparent));
  z-index: 6;
  pointer-events: none;
}
.sf-half {
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  overflow: hidden;
  background: var(--sf-card, color-mix(in srgb, currentColor 5%, transparent));
}
.sf-half.sf-t { top: 0; border-radius: var(--sf-radius, 0.07em) var(--sf-radius, 0.07em) 0 0; }
.sf-half.sf-b { bottom: 0; border-radius: 0 0 var(--sf-radius, 0.07em) var(--sf-radius, 0.07em); }
.sf-half > i {
  position: absolute;
  left: 0;
  width: 100%;
  height: 200%;
  font-style: normal;
  text-align: center;
  line-height: 1.16;
}
.sf-half.sf-t > i { top: 0; }
.sf-half.sf-b > i { bottom: 0; }
.sf-shade {
  position: absolute;
  inset: 0;
  background: #000;
  opacity: 0;
  pointer-events: none;
}
.sf-st, .sf-sb { z-index: 1; }
.sf-mt {
  z-index: 4;
  transform-origin: 50% 100%;
  backface-visibility: hidden;
  will-change: transform;
}
.sf-mb {
  z-index: 3;
  transform-origin: 50% 0%;
  backface-visibility: hidden;
  will-change: transform;
}
.sf-win {
  display: inline-block;
  height: 1em;
  overflow: hidden;
  vertical-align: baseline;
}
.sf-strip {
  display: flex;
  flex-direction: column;
}
.sf-strip > span {
  display: block;
  height: 1em;
  line-height: 1;
}
.sf-space {
  display: inline-block;
  width: 0.6ch;
}
.sf-line {
  display: inline-flex;
  line-height: 1;
  white-space: pre;
  font-variant-numeric: tabular-nums;
}
`;

let injected = false;

/** Idempotent style injection, safe on the server (no-op there). */
export function ensureStyles(): void {
  if (injected || typeof document === "undefined") return;
  if (document.querySelector("style[data-splitflap]")) {
    injected = true;
    return;
  }
  const el = document.createElement("style");
  el.setAttribute("data-splitflap", "");
  el.textContent = CSS;
  document.head.appendChild(el);
  injected = true;
}
