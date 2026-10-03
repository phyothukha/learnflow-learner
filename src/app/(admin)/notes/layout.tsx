"use client";

import { Suspense, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { NotesWorkspaceShell } from "@/components/notes-workspace-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/hooks/use-permission";
import { useWorkspaceNotesHydration } from "@/hooks/use-workspace-notes-hydration";
import { PERMISSIONS } from "@/lib/permissions";
import { privateNotes, useNotesStore } from "@/store/client/notes-store";
import { CURRENT_USER_ID } from "@/store/client/teams-store";
import { NoteVisibility } from "@/store/server/notes/interface";
import { searchNotes } from "@/utils/note";

interface NotesLayoutProps {
  children: React.ReactNode;
}

export default function NotesLayout({ children }: NotesLayoutProps) {
  return (
    <Suspense fallback={<Skeleton className="h-full min-h-64 rounded-xl" />}>
      <NotesLayoutInner>{children}</NotesLayoutInner>
    </Suspense>
  );
}

function NotesLayoutInner({ children }: NotesLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission } = usePermission();
  const canCreate = hasPermission(PERMISSIONS.NOTES_CREATE);
  const ready = useWorkspaceNotesHydration();
  const [search, setSearch] = useState("");
  const notes = useNotesStore((state) => state.notes);
  const createNote = useNotesStore((state) => state.createNote);

  const mine = privateNotes(notes);
  const filtered = searchNotes(mine, search.trim());

  const noteSegment = pathname.match(/^\/notes\/([^/]+)$/)?.[1];
  const isComposer = noteSegment === "new";
  const activeNoteId = noteSegment && !isComposer ? noteSegment : undefined;
  const showDetailPane = Boolean(noteSegment);

  const handleCreate = () => {
    const id = createNote({
      Title: "Untitled note",
      Content: null,
      Visibility: NoteVisibility.Private,
      TeamId: null,
      OwnerId: CURRENT_USER_ID,
      OwnerName: "You",
    });
    router.push(`/notes/${id}`);
  };

  return (
    <NotesWorkspaceShell
      title="Notes"
      description="Your private notes. Shared team notes live under Teams."
      ready={ready}
      notes={filtered}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search private notes…"
      groupLabel="Private"
      groupIcon={Lock}
      activeNoteId={activeNoteId}
      showDetailPane={showDetailPane}
      showHeader
      canCreate={canCreate}
      onCreate={handleCreate}
      noteHref={(id) => `/notes/${id}`}
      emptyLabel={
        search.trim() ? `No notes match "${search}"` : "No private notes yet."
      }
    >
      {children}
    </NotesWorkspaceShell>
  );
}
