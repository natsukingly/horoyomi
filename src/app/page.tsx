import DifficultySlider from "@/components/DifficultySlider";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-zinc-900">
      <main className="flex w-full max-w-md flex-col items-center gap-8 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          horoyomi
        </h1>
        <p className="text-center text-zinc-600 dark:text-zinc-400">
          酔いレベルを選んでください
        </p>
        <DifficultySlider />
      </main>
    </div>
  );
}
