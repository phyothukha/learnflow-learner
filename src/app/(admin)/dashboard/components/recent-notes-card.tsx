"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { WorkspaceNote } from "@/store/server/notes/interface";
import { previewText } from "@/utils/note";
import { WidgetHeader } from "./widget-header";

export function RecentNotesCard({ notes }: { notes: WorkspaceNote[] }) {
  const recent = [...notes]
    .sort((a, b) => dayjs(b.UpdatedAt).valueOf() - dayjs(a.UpdatedAt).valueOf())
    .slice(0, 5);

  return (
    <Card className="shadow-xs">
      <WidgetHeader
        title="Private notes"
        href="/notes"
        linkLabel="Open notes"
      />
      <CardContent>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <NotebookPen className="size-6" />
            <p className="text-sm">No private notes yet.</p>
            <Button size="sm" variant="outline" asChild>
              <Link href="/notes">Write a note</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-1">
            {recent.map((note) => (
              <li key={note.Id}>
                <Link
                  href={`/notes/${note.Id}`}
                  className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <p className="truncate text-sm font-medium">{note.Title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {dayjs(note.UpdatedAt).format("MMM D")} ·{" "}
                    {previewText(note.Content)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
