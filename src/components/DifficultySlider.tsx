"use client";

const LEVELS = [
  { name: "シラフ", emoji: "🧊", color: "#e0f2fe", textColor: "#0c4a6e" },
  { name: "ほろ酔い", emoji: "🍺", color: "#fef9c3", textColor: "#713f12" },
  { name: "酔っ払い", emoji: "🍷", color: "#fed7aa", textColor: "#7c2d12" },
  { name: "べろべろ", emoji: "🥃", color: "#fecaca", textColor: "#7f1d1d" },
  { name: "泥酔", emoji: "🤪", color: "#fca5a5", textColor: "#7f1d1d" },
] as const;

interface DifficultySliderProps {
  level: number;
  onChange: (level: number) => void;
}

export default function DifficultySlider({ level, onChange }: DifficultySliderProps) {
  const index = level - 1;
  const current = LEVELS[index];

  return (
    <div
      className="flex w-full flex-col items-center gap-4 rounded-2xl p-6 transition-colors duration-300"
      style={{ backgroundColor: current.color }}
    >
      <div className="text-5xl" role="img" aria-label={current.name}>
        {current.emoji}
      </div>

      <p
        className="text-xl font-bold transition-colors duration-300"
        style={{ color: current.textColor }}
      >
        Lv.{level} {current.name}
      </p>

      <input
        type="range"
        min={0}
        max={LEVELS.length - 1}
        step={1}
        value={index}
        onChange={(e) => onChange(Number(e.target.value) + 1)}
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
            type="button"
            onClick={() => onChange(i + 1)}
            className={`rounded px-1 py-0.5 transition-opacity ${i === index ? "font-bold opacity-100" : "opacity-50 hover:opacity-75"}`}
          >
            {l.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
