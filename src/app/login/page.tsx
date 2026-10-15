export const metadata = { title: "Вход" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink-950 px-4">
      <form action="/api/login" method="post" className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mb-3 text-4xl">🏛️</div>
          <h1 className="text-xl font-semibold text-ink-900">Совет директоров</h1>
          <p className="mt-1 text-sm text-ink-500">Личная платформа советников</p>
        </div>
        <label className="label" htmlFor="password">Пароль</label>
        <input id="password" name="password" type="password" required autoFocus className="input" />
        {error && <p className="mt-2 text-sm text-red-600">Неверный пароль</p>}
        <button className="btn-primary mt-4 w-full">Войти</button>
      </form>
    </main>
  );
}
