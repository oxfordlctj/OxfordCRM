import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl">🔍</p>
      <h1 className="mt-4 text-xl font-semibold text-ink-900">Страница не найдена</h1>
      <Link href="/" className="btn-primary mt-6">На главную</Link>
    </div>
  );
}
