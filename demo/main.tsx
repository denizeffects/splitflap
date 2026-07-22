import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { SplitFlap } from "../src";
import type {
  SplitFlapMode,
  SplitFlapSpeed,
  SplitFlapTrigger,
} from "../src";

const MODES: SplitFlapMode[] = ["flap", "roll", "scramble", "odometer"];
const SPEEDS: SplitFlapSpeed[] = ["calm", "normal", "quick"];
const TRIGGERS: SplitFlapTrigger[] = ["mount", "inview", "hover", "change"];

const row: React.CSSProperties = {
  display: "flex",
  gap: 18,
  alignItems: "baseline",
  flexWrap: "wrap",
  marginTop: 18,
};
const label: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.2em",
  color: "var(--soft)",
};
const btn = (active: boolean): React.CSSProperties => ({
  background: "none",
  border: "1px solid var(--line)",
  color: active ? "var(--ink)" : "var(--soft)",
  font: "inherit",
  fontSize: 11,
  padding: "4px 10px",
  cursor: "pointer",
  opacity: active ? 1 : 0.7,
});

function Demo() {
  const [text, setText] = useState("departures");
  const [mode, setMode] = useState<SplitFlapMode>("flap");
  const [speed, setSpeed] = useState<SplitFlapSpeed>("normal");
  const [trigger, setTrigger] = useState<SplitFlapTrigger>("mount");
  const [play, setPlay] = useState(0);

  const value = mode === "odometer" ? "1,248,730" : text;

  return (
    <div>
      <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: "-0.02em" }}>
        splitflap
      </h1>
      <p style={{ color: "var(--soft)", marginTop: 6, fontSize: 12 }}>
        split flap text for react · flap, roll, scramble and odometer
      </p>

      <div
        style={{
          marginTop: 48,
          padding: "48px 24px",
          border: "1px solid var(--line)",
          fontSize: 56,
          overflowX: "auto",
        }}
        // remount per config so every change performs immediately
        key={`${mode}-${trigger}-${speed}`}
      >
        <SplitFlap
          text={value}
          mode={mode}
          speed={speed}
          trigger={trigger}
          play={play}
        />
      </div>

      <div style={row}>
        <span style={label}>text</span>
        <input
          value={text}
          maxLength={14}
          onChange={(e) =>
            setText(e.target.value.toLowerCase().replace(/[^a-z0-9 .,!?'&-]/g, ""))
          }
          style={{
            background: "none",
            border: "none",
            borderBottom: "1px solid var(--line)",
            color: "var(--ink)",
            font: "inherit",
            fontSize: 13,
            padding: "4px 2px",
            width: 200,
            outline: "none",
          }}
        />
        <button style={btn(false)} onClick={() => setPlay((p) => p + 1)}>
          replay
        </button>
      </div>

      <div style={row}>
        <span style={label}>mode</span>
        {MODES.map((m) => (
          <button key={m} style={btn(mode === m)} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
      </div>

      <div style={row}>
        <span style={label}>speed</span>
        {SPEEDS.map((s) => (
          <button key={s} style={btn(speed === s)} onClick={() => setSpeed(s)}>
            {s}
          </button>
        ))}
      </div>

      <div style={row}>
        <span style={label}>trigger</span>
        {TRIGGERS.map((t) => (
          <button
            key={t}
            style={btn(trigger === t)}
            onClick={() => setTrigger(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <p style={{ ...label, marginTop: 40 }}>
        scroll target for the inview trigger sits below
      </p>
      <div style={{ height: "120vh" }} />
      <div style={{ fontSize: 40 }}>
        <SplitFlap text="now boarding" mode="flap" trigger="inview" />
      </div>
      <div style={{ height: "20vh" }} />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Demo />
  </StrictMode>,
);
