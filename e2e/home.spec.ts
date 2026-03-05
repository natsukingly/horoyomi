import { test, expect } from "@playwright/test";

test.describe("トップページ", () => {
  test("タイトルとフォームが表示される", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toContainText("horoyomi");
    await expect(page.locator("h2")).toContainText("ほろ酔み");
    await expect(page.locator("#url")).toBeVisible();
    await expect(page.getByRole("button", { name: "ほろ酔みリライト" })).toBeVisible();
  });

  test("ヘッダーとフッターが表示される", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("header")).toContainText("horoyomi");
    await expect(page.locator("footer")).toContainText("2026 horoyomi");
  });
});

test.describe("URL入力バリデーション", () => {
  test("空文字でエラーが表示される", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "ほろ酔みリライト" }).click();
    await expect(page.getByText("URLを入力してください")).toBeVisible();
  });

  test("不正なURLでエラーが表示される", async ({ page }) => {
    await page.goto("/");

    await page.locator("#url").fill("not-a-url");
    await page.getByRole("button", { name: "ほろ酔みリライト" }).click();
    await expect(page.getByText("正しいURL形式で入力してください")).toBeVisible();
  });

  test("エラーは入力変更で消える", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "ほろ酔みリライト" }).click();
    await expect(page.getByText("URLを入力してください")).toBeVisible();

    await page.locator("#url").fill("h");
    await expect(page.getByText("URLを入力してください")).not.toBeVisible();
  });
});

test.describe("難易度スライダー", () => {
  test("初期値はLv.2（ほろ酔い）", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Lv.2 ほろ酔い")).toBeVisible();
  });

  test("スライダーの絵文字ボタンでレベルが変わる", async ({ page }) => {
    await page.goto("/");

    // 泥酔ボタン（5番目）をクリック
    const emojiButtons = page.locator("button").filter({ hasText: "🤪" });
    await emojiButtons.click();
    await expect(page.getByText("Lv.5 泥酔")).toBeVisible();

    // シラフボタン（1番目）をクリック
    const shirafu = page.locator("button").filter({ hasText: "🧊" });
    await shirafu.click();
    await expect(page.getByText("Lv.1 シラフ")).toBeVisible();
  });
});

test.describe("API統合フロー（モック）", () => {
  test("URL送信→リライト結果が表示される", async ({ page }) => {
    // extract API をモック
    await page.route("**/api/extract", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          title: "テスト記事",
          content: "これはテスト用の記事本文です。",
        }),
      });
    });

    // rewrite API をモック
    await page.route("**/api/rewrite", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          rewritten: "## ほろ酔みリライト\n\nこれはリライトされた記事です。",
        }),
      });
    });

    await page.goto("/");
    await page.locator("#url").fill("https://example.com/article");
    await page.getByRole("button", { name: "ほろ酔みリライト" }).click();

    // 結果表示（モックが即座に返るのでローディングは一瞬で終わる）
    await expect(page.getByText("リライト結果")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("これはリライトされた記事です")).toBeVisible();
  });

  test("extract API エラー時にトーストが表示される", async ({ page }) => {
    await page.route("**/api/extract", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "ページの取得に失敗しました" }),
      });
    });

    await page.goto("/");
    await page.locator("#url").fill("https://example.com/broken");
    await page.getByRole("button", { name: "ほろ酔みリライト" }).click();

    // トースト通知
    await expect(page.getByText("ページの取得に失敗しました")).toBeVisible({ timeout: 10000 });
  });

  test("rewrite API エラー時にトーストが表示される", async ({ page }) => {
    await page.route("**/api/extract", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ title: "テスト", content: "本文" }),
      });
    });

    await page.route("**/api/rewrite", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "リライト処理でエラーが発生しました" }),
      });
    });

    await page.goto("/");
    await page.locator("#url").fill("https://example.com/article");
    await page.getByRole("button", { name: "ほろ酔みリライト" }).click();

    await expect(page.getByText("リライト処理でエラーが発生しました")).toBeVisible({ timeout: 10000 });
  });

  test("ローディング中はボタンが無効化される", async ({ page }) => {
    await page.route("**/api/extract", async (route) => {
      // 遅延レスポンス
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ title: "テスト", content: "本文" }),
      });
    });

    await page.goto("/");
    await page.locator("#url").fill("https://example.com/article");
    await page.getByRole("button", { name: "ほろ酔みリライト" }).click();

    const button = page.getByRole("button", { name: "リライト中..." });
    await expect(button).toBeDisabled();
  });
});
