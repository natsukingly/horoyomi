import RewriteForm from "@/components/RewriteForm";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          技術記事を、
          <span className="text-primary-light">ほろ酔み</span>
          で読もう。
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
          技術記事のURLを貼るだけ。酔い度に合わせてリライトします。
        </p>
      </div>
      <RewriteForm />
    </div>
  );
}
