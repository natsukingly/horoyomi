"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import DifficultySlider from "./DifficultySlider";

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function RewriteForm() {
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
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      // 1. 記事を抽出
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
        signal: controller.signal,
      });

      if (!extractRes.ok) {
        const data = await extractRes.json().catch(() => ({}));
        throw new Error(data.error || "記事の取得に失敗しました");
      }

      const { content } = await extractRes.json();

      // 2. リライト
      const rewriteRes = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, level }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!rewriteRes.ok) {
        const data = await rewriteRes.json().catch(() => ({}));
        throw new Error(data.error || "リライトに失敗しました");
      }

      const { rewritten } = await rewriteRes.json();
      setResult(rewritten);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        toast.error("タイムアウトしました。もう一度お試しください。");
      } else if (err instanceof TypeError && err.message === "Failed to fetch") {
        toast.error("ネットワークエラーです。接続を確認してください。");
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("予期しないエラーが発生しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="url" className="mb-2 block text-sm font-medium">
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
            disabled={loading}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-base placeholder-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <DifficultySlider level={level} onChange={setLevel} />

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {loading ? "リライト中..." : "ほろ酔みリライト"}
        </button>
      </form>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-8 text-muted">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          <p className="text-sm">記事を取得してリライトしています...</p>
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="mb-4 text-lg font-bold text-primary">リライト結果</h3>
          <div className="prose prose-sm max-w-none text-foreground">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
