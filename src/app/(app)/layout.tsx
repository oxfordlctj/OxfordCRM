import { BottomNav, Sidebar } from "@/components/Nav";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="pb-20 md:pb-0 md:pl-60">
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      <BottomNav />
    </>
  );
}
