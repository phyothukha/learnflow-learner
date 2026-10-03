"use client";

import { use } from "react";
import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/use-permission";
import { useWorkspaceNotesHydration } from "@/hooks/use-workspace-notes-hydration";
import { PERMISSIONS } from "@/lib/permissions";
import { useNotesStore } from "@/store/client/notes-store";
import {
  CURRENT_USER_ID,
  canAccessTeamNotes,
  useTeamsStore,
} from "@/store/client/teams-store";
import { NoteVisibility } from "@/store/server/notes/interface";
import { useRouter } from "next/navigation";

interface TeamPageProps {
  params: Promise<{ teamId: string }>;
}

export default function TeamPage({ params }: TeamPageProps) {
  const { teamId } = use(params);
  const router = useRouter();
  const { hasPermission } = usePermission();
  const canCreate = hasPermission(PERMISSIONS.NOTES_CREATE);
  const ready = useWorkspaceNotesHydration();
  const team = useTeamsStore((state) =>
    state.teams.find((item) => item.Id === teamId),
  );
  const notes = useNotesStore((state) => state.notes);
  const createNote = useNotesStore((state) => state.createNote);

  if (!ready || !team || !canAccessTeamNotes(team)) return null;

  const count = notes.filter(
    (note) =>
      note.Visibility === NoteVisibility.Team && note.TeamId === team.Id,
  ).length;

  const create = () => {
    const id = createNote({
      Title: "Untitled note",
      Content: null,
      Visibility: NoteVisibility.Team,
      TeamId: team.Id,
      OwnerId: CURRENT_USER_ID,
      OwnerName: "You",
    });
    router.push(`/teams/${team.Id}/notes/${id}`);
  };

  return (
    <div className="library-card flex h-full min-h-0 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
      <NotebookPen className="size-8" />
      <p className="text-sm font-medium text-foreground">
        {count === 0 ? "No notes yet" : "Select a note"}
      </p>
      <p className="max-w-sm text-xs">
        Team notes stay here under Teams — they never appear in your private
        Notes tab.
      </p>
      {canCreate && (
        <Button size="sm" className="mt-2" onClick={create}>
          New note
        </Button>
      )}
    </div>
  );
}
