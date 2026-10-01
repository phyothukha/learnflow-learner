"use client";

import { type PropsWithChildren } from "react";
import { TopNavbar } from "@/layout/top-navbar";
import { AudioAlerts } from "@/hooks/use-audio-alerts";

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-dvh min-h-0 w-full flex-col bg-background">
      <AudioAlerts />
      <TopNavbar />
      {/* Absolute fill so h-full children (e.g. DataTable) get a definite height on mobile too */}
      <main className="relative min-h-0 flex-1">
        <div className="absolute inset-0 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto h-full w-full max-w-[1400px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
