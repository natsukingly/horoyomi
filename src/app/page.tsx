import UrlForm from "@/components/UrlForm";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-lg flex-col items-center gap-8 px-6 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            horoyomi
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            技術記事をほろ酔い気分で要約します
          </p>
        </div>
        <UrlForm />
      </main>
    </div>
  );
}
