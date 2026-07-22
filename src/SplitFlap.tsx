import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  DEFAULT_DRUM,
  type SplitFlapMode,
  type SplitFlapSpeed,
  type SplitFlapTrigger,
} from "./config";
import { ensureStyles } from "./styles";
import { FlapMode } from "./FlapMode";
import { OdometerMode, RollMode } from "./StripModes";
import { ScrambleMode } from "./ScrambleMode";

export interface SplitFlapProps {
  /** the text to display */
  text: string;
  /** flap: hinged cards · roll: sliding columns · scramble: glyph
      flicker · odometer: rolling digits (default: flap) */
  mode?: SplitFlapMode;
  /** tuned motion presets (default: normal) */
  speed?: SplitFlapSpeed;
  /** mount: animate on mount · inview: when scrolled into view ·
      hover: on pointer enter · change: only when text changes
      (default: mount) */
  trigger?: SplitFlapTrigger;
  /** bump this number to replay the animation imperatively */
  play?: number;
  /** custom glyph ring; cells travel through it in order. Glyphs not
      in the ring render statically. (default: space, a-z, 0-9, basic
      punctuation) */
  charSet?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Split flap text for React.
 *
 *   <SplitFlap text="departures" mode="flap" trigger="inview" />
 */
export function SplitFlap({
  text,
  mode = "flap",
  speed = "normal",
  trigger = "mount",
  play = 0,
  charSet = DEFAULT_DRUM,
  className = "",
  style,
}: SplitFlapProps) {
  const hostRef = useRef<HTMLSpanElement | null>(null);
  const [run, setRun] = useState(0);
  // mount and change start armed; inview arms on visibility, hover on
  // first pointer enter
  const [armed, setArmed] = useState(
    trigger === "mount" || trigger === "change",
  );
  const lastPlay = useRef(play);

  useEffect(() => {
    ensureStyles();
  }, []);

  // inview: arm once the host scrolls into view
  useEffect(() => {
    if (trigger !== "inview" || armed) return;
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setArmed(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [trigger, armed]);

  // external replay handle
  useEffect(() => {
    if (play !== lastPlay.current) {
      lastPlay.current = play;
      setArmed(true);
      setRun((r) => r + 1);
    }
  }, [play]);

  const onHover = useCallback(() => {
    if (trigger !== "hover") return;
    setArmed(true);
    setRun((r) => r + 1);
  }, [trigger]);

  let body: React.ReactNode;
  if (mode === "flap") {
    // flap is always mounted; its `initial` prop encodes the trigger:
    // mount boots at once, inview holds blank until armed, hover and
    // change sit settled until their event bumps `run`
    const initial: "animate" | "settle" | "hold" =
      trigger === "mount"
        ? "animate"
        : trigger === "inview"
          ? armed
            ? "animate"
            : "hold"
          : "settle";
    body = (
      <FlapMode
        text={text}
        drum={charSet}
        speed={speed}
        run={run}
        initial={initial}
      />
    );
  } else if (!armed) {
    // strip modes before their trigger event: hover shows settled
    // text, inview reserves layout invisibly until it can perform
    body = (
      <span
        className="sf-line"
        style={trigger === "inview" ? { visibility: "hidden" } : undefined}
        aria-hidden
      >
        {text}
      </span>
    );
  } else {
    const animateFirstRun = trigger !== "change";
    body =
      mode === "roll" ? (
        <RollMode
          text={text}
          drum={charSet}
          speed={speed}
          run={run}
          animateFirstRun={animateFirstRun}
        />
      ) : mode === "scramble" ? (
        <ScrambleMode
          text={text}
          drum={charSet}
          speed={speed}
          run={run}
          animateFirstRun={animateFirstRun}
        />
      ) : (
        <OdometerMode
          text={text}
          speed={speed}
          run={run}
          animateFirstRun={animateFirstRun}
        />
      );
  }

  return (
    <span
      ref={hostRef}
      className={`sf-host ${className}`}
      style={style}
      onPointerEnter={onHover}
    >
      <span className="sf-sr">{text}</span>
      {body}
    </span>
  );
}
