"use client";

import { useState } from "react";
import toast from "react-hot-toast";

const DRUNK_LEVELS = [
  { value: 1, label: "シラフ" },
  { value: 2, label: "ほろ酔い" },
  { value: 3, label: "酔っ払い" },
  { value: 4, label: "べろべろ" },
  { value: 5, label: "泥酔" },
] as const;

const TIMEOUT_MS = 30_000;

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "リクエストがタイムアウトしました（30秒）。時間をおいて再度お試しください。";
  }
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "ネットワークに接続できません。インターネット接続を確認してください。";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "予期しないエラーが発生しました。";
}

export default function UrlForm() {
  const [url, setUrl] = useState("");
  const [level, setLevel] = useState(2);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
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
    setResult("");
    setLoading(true);

    try {
      // Step 1: 記事を抽出
      const extractRes = await fetchWithTimeout("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      if (!extractRes.ok) {
        const data = await extractRes.json().catch(() => null);
        const message = data?.error || `記事の取得に失敗しました（HTTP ${extractRes.status}）`;
        toast.error(message);
        setError(message);
        return;
      }

      const { content } = await extractRes.json();
      if (!content || content.trim() === "") {
        const message = "記事の本文を取得できませんでした。URLを確認してください。";
        toast.error(message);
        setError(message);
        return;
      }

      // Step 2: リライト
      const rewriteRes = await fetchWithTimeout("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, level }),
      });

      if (!rewriteRes.ok) {
        const data = await rewriteRes.json().catch(() => null);
        const message = data?.error || `リライト処理に失敗しました（HTTP ${rewriteRes.status}）`;
        toast.error(message);
        setError(message);
        return;
      }

      const { rewritten } = await rewriteRes.json();
      setResult(rewritten);
      toast.success("要約が完了しました！");
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const currentLabel = DRUNK_LEVELS[level - 1].label;

  return (
    <div className="w-full max-w-lg space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
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
            disabled={loading}
            placeholder="https://example.com/article"
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
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
            disabled={loading}
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
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {loading ? "処理中..." : "要約する"}
        </button>
      </form>

      {result && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            要約結果
          </h2>
          <div className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
