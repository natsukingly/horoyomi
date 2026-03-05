import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: NextRequest) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストボディが不正です" },
      { status: 400 }
    );
  }

  const { url } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "url フィールドは必須です" },
      { status: 400 }
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json(
      { error: "無効なURLです" },
      { status: 400 }
    );
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json(
      { error: "http または https のURLを指定してください" },
      { status: 400 }
    );
  }

  let html: string;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Horoyomi/1.0; +https://github.com/natsukingly/horoyomi)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `ページの取得に失敗しました (HTTP ${response.status})` },
        { status: 502 }
      );
    }

    html = await response.text();
  } catch (error) {
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? "リクエストがタイムアウトしました"
        : "ページの取得に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const $ = cheerio.load(html);

  $("script, style, nav, header, footer, aside, iframe, noscript, svg, form, [role='navigation'], [role='banner'], [role='contentinfo']").remove();

  const title =
    $("meta[property='og:title']").attr("content") ||
    $("h1").first().text().trim() ||
    $("title").text().trim() ||
    "";

  let contentElement = $("article");
  if (contentElement.length === 0) {
    contentElement = $("main");
  }
  if (contentElement.length === 0) {
    contentElement = $("body");
  }

  const content = contentElement
    .text()
    .replace(/\s+/g, " ")
    .trim();

  return NextResponse.json({ title, content });
}
