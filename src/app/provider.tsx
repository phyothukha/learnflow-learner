"use client";

import { useEffect, useState, type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import useStore from "@/store/client/use-store";

export default function Providers({ children }: PropsWithChildren) {
  // Cookie-backed client state is read after mount so the first client render
  // matches the server HTML (avoids hydration attribute mismatches).
  useEffect(() => {
    const { hydrateWorkspace, hydratePrimaryColor } = useStore.getState();
    hydrateWorkspace();
    hydratePrimaryColor();
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
