# splitflap

split flap text for react. hinged cards that flip like an airport departure board, plus roll, scramble and odometer modes. zero dependencies, ssr safe, respects reduced motion.

## install

```bash
npm install splitflap
```

## quick start

```tsx
import { SplitFlap } from "splitflap";

<SplitFlap text="departures" />
```

styles are injected automatically on first mount. nothing else to import.

## modes

```tsx
<SplitFlap text="departures" mode="flap" />      // hinged cards, the classic board
<SplitFlap text="departures" mode="roll" />      // columns glide through the alphabet
<SplitFlap text="departures" mode="scramble" />  // glyphs flicker and settle left to right
<SplitFlap text="1,248,730" mode="odometer" />   // digits roll like a counter
```

## triggers

```tsx
<SplitFlap text="arrivals" trigger="mount" />   // plays as soon as it mounts (default)
<SplitFlap text="arrivals" trigger="inview" />  // waits until scrolled into view
<SplitFlap text="arrivals" trigger="hover" />   // sits settled, plays on pointer enter
<SplitFlap text={status} trigger="change" />    // only animates when the text prop changes
```

with `trigger="change"` the flap mode flips just the cells whose glyph changed, straight from the old character to the new one through the drum. live tickers, statuses and clocks work out of the box.

## props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `text` | `string` | | the text to display |
| `mode` | `"flap" \| "roll" \| "scramble" \| "odometer"` | `"flap"` | |
| `speed` | `"calm" \| "normal" \| "quick"` | `"normal"` | individually tuned presets, not multipliers |
| `trigger` | `"mount" \| "inview" \| "hover" \| "change"` | `"mount"` | |
| `play` | `number` | `0` | bump it to replay imperatively |
| `charSet` | `string` | space, a-z, 0-9, basic punctuation | the ordered glyph ring cells travel through |
| `className` | `string` | | applied to the host span |
| `style` | `CSSProperties` | | applied to the host span |

size follows the host font-size: everything is measured in em, so `style={{ fontSize: 64 }}` gives you a big board.

## theming

flap cards read a few css custom properties, all optional:

```css
.my-board {
  --sf-card: #131312;         /* card background */
  --sf-card-border: #2a2925;  /* card border and center seam */
  --sf-ink: #eae8e1;          /* glyph color, defaults to currentColor */
  --sf-radius: 3px;           /* card corner radius */
}
```

defaults derive from `currentColor`, so the board looks right on light and dark backgrounds without any setup.

## accessibility

the animated glyphs are aria-hidden. screen readers get the plain text, always current. with `prefers-reduced-motion` every mode renders its final state instantly.

## license

mit
