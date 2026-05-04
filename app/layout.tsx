import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: "Агроном — Дневник микрозелени",
  description: "Управление выращиванием микрозелени: стеллажи, контейнеры, уведомления",
};

export const viewport: Viewport = {
  themeColor: "#070F09",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="flex min-h-screen">
          {/* Desktop sidebar */}
          <Sidebar />

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
            <main className="flex-1 px-4 py-6 md:px-6 lg:px-8 pb-24 lg:pb-8">
              {children}
            </main>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />
      </body>
    </html>
  );
}
