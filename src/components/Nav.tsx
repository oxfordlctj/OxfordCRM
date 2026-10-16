"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Главная", icon: "🏠" },
  { href: "/board", label: "Совет", icon: "🏛️" },
  { href: "/advisors", label: "Советники", icon: "💬" },
  { href: "/decisions", label: "Решения", icon: "✅" },
  { href: "/dossier", label: "Досье", icon: "🗂️" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/advisors") return pathname.startsWith("/advisors") || pathname.startsWith("/chat");
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-ink-950 px-4 py-6 text-ink-100 md:flex">
      <Link href="/" className="mb-8 flex items-center gap-3 px-2">
        <span className="text-2xl">🏛️</span>
        <span>
          <span className="block text-sm font-semibold text-white">Совет директоров</span>
          <span className="block text-xs text-ink-400">Oxford · Душанбе</span>
        </span>
      </Link>
      <nav className="flex flex-col gap-1">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
              isActive(pathname, item.href)
                ? "bg-ink-800 text-white"
                : "text-ink-300 hover:bg-ink-900 hover:text-white"
            }`}
          >
            <span className="w-5 text-center">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <form action="/api/logout" method="post" className="mt-auto">
        <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-ink-400 hover:bg-ink-900 hover:text-white">
          ↩ Выйти
        </button>
      </form>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-ink-800 bg-ink-950 pb-[env(safe-area-inset-bottom)] md:hidden">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
            isActive(pathname, item.href) ? "text-gold-300" : "text-ink-300"
          }`}
        >
          <span className="text-lg leading-none">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
