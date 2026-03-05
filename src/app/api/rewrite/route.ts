import { NextRequest, NextResponse } from "next/server";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const MODEL_ID = "us.anthropic.claude-haiku-4-5-20251001-v1:0";
const MAX_TOKENS = 4096;

const LEVEL_PROMPTS: Record<number, { name: string; instruction: string }> = {
  1: {
    name: "シラフ",
    instruction:
      "以下の記事本文を、構造を整理するだけでリライトしてください。内容や語調は変えず、読みやすく整理してください。",
  },
  2: {
    name: "ほろ酔い",
    instruction:
      "以下の記事本文をリライトしてください。専門用語が出てきたら、簡単な説明を括弧書きなどで追加して、初心者にも分かりやすくしてください。",
  },
  3: {
    name: "酔っ払い",
    instruction:
      "以下の記事本文を、比喩や例え話を多用し、カジュアルな口調でリライトしてください。難しい概念は身近なものに例えて説明してください。",
  },
  4: {
    name: "べろべろ",
    instruction:
      "以下の記事本文を、極限まで簡略化してリライトしてください。絵文字を多めに使い、小学生でも分かるくらい簡単な言葉で説明してください。",
  },
  5: {
    name: "泥酔",
    instruction:
      "以下の記事本文を、酔っ払いの口調でリライトしてください。ネタやギャグを混ぜつつ、内容は伝わるようにしてください。「うぇーい」「まじかよ〜」などの酔っ払い特有の口調を使ってください。",
  },
};

function createBedrockClient(): BedrockRuntimeClient {
  return new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "ap-northeast-1",
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストボディのJSONが不正です" },
      { status: 400 }
    );
  }

  const { content, level } = body as { content?: string; level?: number };

  if (!content || typeof content !== "string" || content.trim() === "") {
    return NextResponse.json(
      { error: "content は空でない文字列で指定してください" },
      { status: 400 }
    );
  }

  if (level === undefined || !Number.isInteger(level) || level < 1 || level > 5) {
    return NextResponse.json(
      { error: "level は 1〜5 の整数で指定してください" },
      { status: 400 }
    );
  }

  const prompt = LEVEL_PROMPTS[level];

  const client = createBedrockClient();
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: "user" as const,
        content: `${prompt.instruction}\n\n---\n\n${content}`,
      },
    ],
  };

  try {
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const rewritten: string = responseBody.content?.[0]?.text ?? "";

    return NextResponse.json({ rewritten });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "不明なエラーが発生しました";
    console.error("Bedrock API error:", message);
    return NextResponse.json(
      { error: "リライト処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
