"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LogOut, Menu, Volume2, VolumeX } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PrimaryColorPicker } from "@/components/primary-color-picker";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { navLinks } from "@/assets/nav-links";
import { useConfirmLogout } from "@/hooks/use-confirm-logout";
import { usePermission } from "@/hooks/use-permission";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/client/use-store";

/** Longest matching nav href for the current path (avoids prefix false-positives). */
function matchNavHref(pathname: string, hrefs: string[]) {
  return hrefs
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/dashboard"
      onClick={onNavigate}
      className="flex shrink-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Image
        src="/learnflow-logo.svg"
        alt="LearnFlow"
        width={28}
        height={28}
        priority
        className="size-7 shrink-0"
      />
      <span className="brand-wordmark text-lg">LearnFlow</span>
    </Link>
  );
}

interface IndicatorPosition {
  left: number;
  width: number;
}

interface PendingNav {
  href: string;
  from: string;
}

export function TopNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { hasAnyPermission } = usePermission();
  const { confirmLogout, dialogProps } = useConfirmLogout();
  const { soundMuted, toggleSoundMuted } = useWorkspaceStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState<IndicatorPosition | null>(null);
  const [animate, setAnimate] = useState(false);
  const [pending, setPending] = useState<PendingNav | null>(null);

  const items = navLinks
    .flatMap((group) => group.items)
    .filter((item) => hasAnyPermission(item.requiredPermissions));
  const name = session?.user?.name ?? "?";

  const routeHref = matchNavHref(
    pathname,
    items.map((item) => item.href),
  );
  const activeHref =
    pending && pending.from === pathname ? pending.href : routeHref;

  // Clear optimistic nav when the real route changes (or when navigating via
  // in-page links like Dashboard "Open tasks" that never set pending).
  useEffect(() => {
    setPending(null);
  }, [pathname]);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const measure = () => {
      const link = activeHref
        ? nav.querySelector<HTMLElement>(`[data-nav-item="${activeHref}"]`)
        : null;
      setIndicator(
        link ? { left: link.offsetLeft, width: link.offsetWidth } : null,
      );
    };

    measure();
    const frame = requestAnimationFrame(() => setAnimate(true));
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [activeHref]);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2 md:gap-8">
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 size-9 md:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <Brand />
          <nav
            ref={navRef}
            className="relative hidden h-14 items-stretch gap-1 md:flex"
          >
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-t-full bg-primary",
                animate &&
                  "transition-[transform,width,opacity] duration-300 ease-in-out",
              )}
              style={{
                opacity: indicator ? 1 : 0,
                width: indicator?.width ?? 0,
                transform: `translateX(${indicator?.left ?? 0}px)`,
              }}
            />
            {items.map((item) => {
              const active = item.href === activeHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-nav-item={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => {
                    if (item.href !== routeHref)
                      setPending({ href: item.href, from: pathname });
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 font-poppins text-sm font-medium transition-colors duration-200 outline-none focus-visible:bg-accent",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <PrimaryColorPicker />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            title={soundMuted ? "Unmute alert sounds" : "Mute alert sounds"}
            onClick={toggleSoundMuted}
          >
            {soundMuted ? (
              <VolumeX className="size-4 text-muted-foreground" />
            ) : (
              <Volume2 className="size-4" />
            )}
          </Button>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Account menu"
              >
                <Avatar className="size-8">
                  <AvatarFallback>{getInitials(name)}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate">{session?.user?.name}</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {session?.user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void confirmLogout()}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 gap-0 p-0">
          <SheetHeader className="h-14 justify-center border-b px-4">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Brand onNavigate={() => setMenuOpen(false)} />
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-3">
            {items.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 font-poppins text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
      <ConfirmDialog {...dialogProps} />
    </>
  );
}
