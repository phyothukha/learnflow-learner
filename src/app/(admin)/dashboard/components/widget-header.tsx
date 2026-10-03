"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface WidgetHeaderProps {
  title: string;
  href: string;
  linkLabel: string;
}

export function WidgetHeader({ title, href, linkLabel }: WidgetHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Link
        href={href}
        prefetch
        className={cn(
          "inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium",
          "text-primary transition-colors hover:bg-primary/10",
        )}
      >
        {linkLabel}
        <ArrowRight className="size-3" />
      </Link>
    </CardHeader>
  );
}
