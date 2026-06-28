"use client";

import { usePathname } from "next/navigation";
import { MobileHeader } from "./MobileHeader";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <main>{children}</main>;
  }

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col lg:ml-[248px]">
          <MobileHeader />
          <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 md:pt-7 lg:px-10 lg:pb-10 lg:pt-10">
            {children}
          </main>
        </div>
      </div>
      <MobileNav />
    </>
  );
}
