import { NextRequest, NextResponse } from "next/server";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const LEVEL_PROMPTS: Record<number, string> = {
  1: "以下の技術記事を、専門用語はそのまま残しつつ、構造を整理して読みやすくリライトしてください。トーンはフォーマルで。",
  2: "以下の技術記事を、専門用語に簡単な説明を追加しながらリライトしてください。少しカジュアルな口調で。",
  3: "以下の技術記事を、比喩や例え話を多用して、酔っ払いの友達に説明するようなカジュアルな口調でリライトしてください。「〜だよね」「〜じゃん」のような話し言葉を使って。",
  4: "以下の技術記事を、5歳児でも分かるレベルまで極限に簡略化してリライトしてください。絵文字を多用し、「すごい！」「やばい！」のような感嘆表現を使って。難しい言葉は全て身近なものに例えて。",
  5: "以下の技術記事を、泥酔した酔っ払いが語るような口調でリライトしてください。「うぃ〜」「ひっく」などの酔っ払い表現を混ぜ、話が脱線したり繰り返したりしてもOK。ギャグやダジャレも入れて。でも技術的な内容の核心は伝えて。",
};

const MAX_CONTENT_LENGTH = 10000;
const MAX_TOKENS = 4096;

export async function POST(request: NextRequest) {
  let body: { content?: string; level?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストボディが不正です" },
      { status: 400 }
    );
  }

  const { content, level } = body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json(
      { error: "content フィールドは必須です" },
      { status: 400 }
    );
  }

  if (!level || typeof level !== "number" || level < 1 || level > 5) {
    return NextResponse.json(
      { error: "level は 1〜5 の数値で指定してください" },
      { status: 400 }
    );
  }

  const truncatedContent = content.slice(0, MAX_CONTENT_LENGTH);
  const systemPrompt = LEVEL_PROMPTS[level];

  try {
    const client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "ap-northeast-1",
    });

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: truncatedContent,
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId:
        process.env.BEDROCK_MODEL_ID ||
        "us.anthropic.claude-haiku-4-5-20251001-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const rewritten = responseBody.content[0].text;

    return NextResponse.json({ rewritten });
  } catch (error) {
    console.error("Bedrock API error:", error);
    return NextResponse.json(
      { error: "リライト処理でエラーが発生しました" },
      { status: 500 }
    );
  }
}
