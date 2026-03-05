"use client";

import { useState } from "react";

const LEVELS = [
  { name: "しらふ", emoji: "\u{1F9CA}", color: "#e0f2fe", textColor: "#0c4a6e" },
  { name: "ほろ酔い", emoji: "\u{1F37A}", color: "#fef9c3", textColor: "#713f12" },
  { name: "いい感じ", emoji: "\u{1F377}", color: "#fed7aa", textColor: "#7c2d12" },
  { name: "べろべろ", emoji: "\u{1F943}", color: "#fecaca", textColor: "#7f1d1d" },
  { name: "泥酔", emoji: "\u{1F92A}", color: "#fca5a5", textColor: "#7f1d1d" },
] as const;

export default function DifficultySlider() {
  const [level, setLevel] = useState(0);
  const current = LEVELS[level];

  return (
    <div
      className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl p-8 transition-colors duration-300"
      style={{ backgroundColor: current.color }}
    >
      <div className="text-6xl" role="img" aria-label={current.name}>
        {current.emoji}
      </div>

      <div className="text-center">
        <p
          className="text-2xl font-bold transition-colors duration-300"
          style={{ color: current.textColor }}
        >
          Lv.{level + 1} {current.name}
        </p>
        <p
          className="mt-1 text-sm opacity-70"
          style={{ color: current.textColor }}
        >
          {level + 1} / {LEVELS.length}
        </p>
      </div>

      <input
        type="range"
        min={0}
        max={LEVELS.length - 1}
        step={1}
        value={level}
        onChange={(e) => setLevel(Number(e.target.value))}
        className="slider h-3 w-full cursor-pointer appearance-none rounded-full outline-none"
        style={{
          background: `linear-gradient(to right, ${LEVELS.map((l, i) => l.color + " " + (i / (LEVELS.length - 1)) * 100 + "%").join(", ")})`,
        }}
        aria-label="難易度レベル"
      />

      <div className="flex w-full justify-between text-xs" style={{ color: current.textColor }}>
        {LEVELS.map((l, i) => (
          <button
            key={i}
            onClick={() => setLevel(i)}
            className={`rounded px-1 py-0.5 transition-opacity ${i === level ? "font-bold opacity-100" : "opacity-50 hover:opacity-75"}`}
          >
            {l.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
