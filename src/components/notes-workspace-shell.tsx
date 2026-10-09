"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { SquarePen, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SearchInput } from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { WorkspaceNote } from "@/store/server/notes/interface";
import { previewText } from "@/utils/note";

export interface NotesWorkspaceShellProps {
  title: string;
  description?: string;
  ready: boolean;
  notes: WorkspaceNote[];
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  groupLabel: string;
  groupIcon: LucideIcon;
  groupColor?: string;
  activeNoteId?: string;
  showDetailPane: boolean;
  showHeader: boolean;
  canCreate: boolean;
  onCreate: () => void;
  noteHref: (noteId: string) => string;
  backHref?: string;
  emptyLabel: string;
  children: React.ReactNode;
  /** Extra actions next to the page header title. */
  headerActions?: React.ReactNode;
}

export function NotesWorkspaceShell({
  title,
  description,
  ready,
  notes,
  search,
  onSearchChange,
  searchPlaceholder = "Search notes…",
  groupLabel,
  groupIcon: GroupIcon,
  groupColor,
  activeNoteId,
  showDetailPane,
  showHeader,
  canCreate,
  onCreate,
  noteHref,
  emptyLabel,
  children,
  headerActions,
}: NotesWorkspaceShellProps) {
  const header = (
    <PageHeader
      title={title}
      description={description}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {headerActions}
          {canCreate ? (
            <Button onClick={onCreate} disabled={!ready}>
              <SquarePen />
              New note
            </Button>
          ) : null}
        </div>
      }
    />
  );

  if (!ready) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-6">
        {showHeader && header}
        <Skeleton className="min-h-0 flex-1 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      {showHeader && header}
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-5">
        <aside
          className={cn(
            "library-card",
            "flex h-full min-h-0 min-w-0 flex-col overflow-hidden",
            showDetailPane && "hidden lg:flex",
          )}
        >
          <div className="flex shrink-0 items-center gap-2 border-b px-3 py-2.5">
            <SearchInput
              value={search}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              className="flex-1 sm:w-auto"
            />
            {canCreate && (
              <Button
                variant="ghost"
                size="icon"
                className="size-9 shrink-0"
                title="New note"
                onClick={onCreate}
              >
                <SquarePen className="size-4" />
              </Button>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            <p className="flex items-center gap-1.5 px-2 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              <GroupIcon
                className="size-3"
                style={groupColor ? { color: groupColor } : undefined}
              />
              {groupLabel}
            </p>
            {notes.length === 0 ? (
              <p className="px-2 py-10 text-center text-xs text-muted-foreground">
                {emptyLabel}
              </p>
            ) : (
              <ul className="space-y-0.5">
                {notes.map((note) => (
                  <li key={note.Id}>
                    <Link
                      href={noteHref(note.Id)}
                      className={cn(
                        "block min-w-0 overflow-hidden rounded-lg px-2.5 py-2 transition-colors hover:bg-accent/60",
                        activeNoteId === note.Id && "bg-accent",
                      )}
                    >
                      <p className="w-full truncate text-sm font-medium">
                        {note.Title}
                      </p>
                      <p className="w-full truncate text-xs text-muted-foreground">
                        {dayjs(note.UpdatedAt).format("MMM D")} ·{" "}
                        {previewText(note.Content)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
        <div
          className={cn(
            "flex h-full min-h-0 min-w-0 flex-col",
            !showDetailPane && "hidden lg:flex",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
