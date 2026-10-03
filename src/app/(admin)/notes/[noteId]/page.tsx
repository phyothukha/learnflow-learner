"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceNoteDetail } from "@/components/workspace-note-detail";
import { useWorkspaceNotesHydration } from "@/hooks/use-workspace-notes-hydration";
import { useNotesStore } from "@/store/client/notes-store";
import { NoteVisibility } from "@/store/server/notes/interface";

interface NoteDetailPageProps {
  params: Promise<{ noteId: string }>;
}

/** Private notes only. Team notes redirect into /teams/... */
export default function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { noteId } = use(params);
  const router = useRouter();
  const ready = useWorkspaceNotesHydration();
  const note = useNotesStore((state) =>
    state.notes.find((item) => item.Id === noteId),
  );

  useEffect(() => {
    if (!ready || !note) return;
    if (note.Visibility === NoteVisibility.Team && note.TeamId) {
      router.replace(`/teams/${note.TeamId}/notes/${note.Id}`);
    }
  }, [ready, note, router]);

  if (!ready) return null;
  if (note?.Visibility === NoteVisibility.Team) return null;

  return (
    <WorkspaceNoteDetail
      noteId={noteId}
      backHref="/notes"
      expectedVisibility={NoteVisibility.Private}
    />
  );
}
