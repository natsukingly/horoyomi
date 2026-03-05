export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-surface px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-bold text-primary sm:text-2xl">
            horoyomi
          </h1>
          <span className="text-sm text-muted">ほろ酔みダッシュボード</span>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Hero */}
        <section className="mb-8 rounded-xl bg-surface p-6 sm:mb-10 sm:p-8 lg:p-10">
          <h2 className="mb-3 text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
            今日の一杯を、
            <br className="sm:hidden" />
            <span className="text-primary-light">記録しよう。</span>
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            お気に入りの居酒屋やお酒をかんたんに記録・管理。
            自分だけのほろ酔みダイアリーを作りましょう。
          </p>
        </section>

        {/* Feature cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="お酒の記録"
            description="飲んだお酒を写真付きで記録。味わいや感想をメモできます。"
          />
          <FeatureCard
            title="お店の管理"
            description="お気に入りの居酒屋やバーをブックマーク。次の一杯の参考に。"
          />
          <FeatureCard
            title="ほろ酔みログ"
            description="飲酒の記録を振り返って、自分のペースを把握しましょう。"
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface px-4 py-6 text-center text-sm text-muted sm:px-6 lg:px-8">
        <p>horoyomi &copy; 2026</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-alt p-5 transition-shadow hover:shadow-md sm:p-6">
      <h3 className="mb-2 text-lg font-bold text-primary">{title}</h3>
      <p className="text-sm leading-relaxed text-muted sm:text-base">
        {description}
      </p>
    </div>
  );
}
