"use client";

import { use } from "react";
import { WorkspaceNoteDetail } from "@/components/workspace-note-detail";
import { NoteVisibility } from "@/store/server/notes/interface";

interface TeamNotePageProps {
  params: Promise<{ teamId: string; noteId: string }>;
}

export default function TeamNotePage({ params }: TeamNotePageProps) {
  const { teamId, noteId } = use(params);

  return (
    <WorkspaceNoteDetail
      noteId={noteId}
      backHref={`/teams/${teamId}`}
      expectedVisibility={NoteVisibility.Team}
    />
  );
}
