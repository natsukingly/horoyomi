"use client";

import { useState } from "react";

const DRUNK_LEVELS = [
  { value: 1, label: "シラフ" },
  { value: 2, label: "ほろ酔い" },
  { value: 3, label: "酔っ払い" },
  { value: 4, label: "べろべろ" },
  { value: 5, label: "泥酔" },
] as const;

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function UrlForm() {
  const [url, setUrl] = useState("");
  const [level, setLevel] = useState(2);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = url.trim();
    if (!trimmed) {
      setError("URLを入力してください");
      return;
    }
    if (!isValidUrl(trimmed)) {
      setError("正しいURL形式で入力してください（例: https://example.com）");
      return;
    }

    setError("");
    console.log("URL:", trimmed);
    console.log("難易度レベル:", level, DRUNK_LEVELS[level - 1].label);
  };

  const currentLabel = DRUNK_LEVELS[level - 1].label;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
      <div>
        <label htmlFor="url" className="block text-sm font-medium mb-2">
          技術記事のURL
        </label>
        <input
          id="url"
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError("");
          }}
          placeholder="https://example.com/article"
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="level" className="block text-sm font-medium mb-2">
          酔い度: <span className="font-bold text-lg">{currentLabel}</span>
        </label>
        <input
          id="level"
          type="range"
          min={1}
          max={5}
          step={1}
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="w-full accent-zinc-700 dark:accent-zinc-300"
        />
        <div className="flex justify-between text-xs text-zinc-500 mt-1">
          {DRUNK_LEVELS.map((d) => (
            <span key={d.value}>{d.label}</span>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        要約する
      </button>
    </form>
  );
}
