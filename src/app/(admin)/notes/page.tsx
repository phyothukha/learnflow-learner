"use client";

import { useRouter } from "next/navigation";
import { Lock, NotebookPen } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { useWorkspaceNotesHydration } from "@/hooks/use-workspace-notes-hydration";
import { PERMISSIONS } from "@/lib/permissions";
import { useRequirePermission } from "@/hooks/use-require-permission";
import { privateNotes, useNotesStore } from "@/store/client/notes-store";
import { CURRENT_USER_ID } from "@/store/client/teams-store";
import { NoteVisibility } from "@/store/server/notes/interface";
import { Button } from "@/components/ui/button";

export default function NotesPage() {
  const router = useRouter();
  const { hasPermission } = usePermission();
  const canView = useRequirePermission(PERMISSIONS.NOTES_VIEW);
  const canCreate = hasPermission(PERMISSIONS.NOTES_CREATE);
  const ready = useWorkspaceNotesHydration();
  const notes = useNotesStore((state) => state.notes);
  const createNote = useNotesStore((state) => state.createNote);

  if (!canView || !ready) return null;

  const mine = privateNotes(notes);

  const create = () => {
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
    <div className="library-card flex h-full min-h-0 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
      <NotebookPen className="size-8" />
      <p className="text-sm font-medium text-foreground">
        {mine.length === 0 ? "No private notes yet" : "Select a note"}
      </p>
      <p className="max-w-sm text-xs">
        Private notes stay here. For team notes, open a team under Teams.
      </p>
      {canCreate && (
        <Button className="mt-2" onClick={create}>
          <Lock />
          Private note
        </Button>
      )}
    </div>
  );
}
