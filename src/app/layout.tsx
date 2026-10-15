import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Совет директоров", template: "%s · Совет директоров" },
  description: "Личный совет директоров и советники по бизнесу и жизни",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#141c2d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
