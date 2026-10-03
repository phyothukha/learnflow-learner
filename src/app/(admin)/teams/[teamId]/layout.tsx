"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Lock, UsersRound } from "lucide-react";
import { NotesWorkspaceShell } from "@/components/notes-workspace-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/hooks/use-permission";
import { useWorkspaceNotesHydration } from "@/hooks/use-workspace-notes-hydration";
import { PERMISSIONS } from "@/lib/permissions";
import { useNotesStore } from "@/store/client/notes-store";
import {
  CURRENT_USER_ID,
  canAccessTeamNotes,
  isTeamMember,
  useTeamsStore,
} from "@/store/client/teams-store";
import { NoteVisibility } from "@/store/server/notes/interface";
import { searchNotes } from "@/utils/note";

interface TeamNotesLayoutProps {
  children: React.ReactNode;
  params: Promise<{ teamId: string }>;
}

export default function TeamNotesLayout({
  children,
  params,
}: TeamNotesLayoutProps) {
  const { teamId } = use(params);
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const { hasPermission } = usePermission();
  const canView = hasPermission(PERMISSIONS.NOTES_VIEW);
  const canCreate = hasPermission(PERMISSIONS.NOTES_CREATE);
  const ready = useWorkspaceNotesHydration();
  const [search, setSearch] = useState("");
  const team = useTeamsStore((state) =>
    state.teams.find((item) => item.Id === teamId),
  );
  const notes = useNotesStore((state) => state.notes);
  const createNote = useNotesStore((state) => state.createNote);

  useEffect(() => {
    if (status === "authenticated" && !canView) router.replace("/forbidden");
  }, [status, canView, router]);

  if (status !== "authenticated" || !canView || !ready) {
    return <Skeleton className="h-full min-h-64 rounded-xl" />;
  }

  if (!team || !isTeamMember(team)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <Lock className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">You’re not in this team</p>
        <Button variant="subtle" asChild>
          <Link href="/teams">Back to teams</Link>
        </Button>
      </div>
    );
  }

  const notesAccess = canAccessTeamNotes(team);
  if (!notesAccess) {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button variant="subtle" size="icon" className="size-9" asChild>
            <Link href="/teams">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: team.Color }}
            />
            <h1 className="text-xl font-semibold tracking-tight">
              {team.Name}
            </h1>
          </div>
        </div>
        <div className="library-card flex flex-1 flex-col items-center justify-center gap-2 px-4 py-16 text-center">
          <Lock className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">No notes access</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            An admin added you without notes access for this team.
          </p>
        </div>
      </div>
    );
  }

  const teamNotes = notes.filter(
    (note) =>
      note.Visibility === NoteVisibility.Team && note.TeamId === team.Id,
  );
  const filtered = searchNotes(teamNotes, search.trim());

  const noteMatch = pathname.match(
    new RegExp(`^/teams/${team.Id}/notes/([^/]+)$`),
  )?.[1];
  const isComposer = noteMatch === "new";
  const activeNoteId = noteMatch && !isComposer ? noteMatch : undefined;
  const showDetailPane = Boolean(noteMatch);

  const handleCreate = () => {
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
    <NotesWorkspaceShell
      title={team.Name}
      description={
        team.Description || "Shared notes for everyone with notes access."
      }
      ready
      notes={filtered}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search team notes…"
      groupLabel="Team notes"
      groupIcon={UsersRound}
      groupColor={team.Color}
      activeNoteId={activeNoteId}
      showDetailPane={showDetailPane}
      showHeader
      canCreate={canCreate}
      onCreate={handleCreate}
      noteHref={(id) => `/teams/${team.Id}/notes/${id}`}
      backHref="/teams"
      emptyLabel={
        search.trim() ? `No notes match "${search}"` : "No team notes yet."
      }
      headerActions={
        <Button variant="ghost" size="sm" asChild>
          <Link href="/teams">
            <ArrowLeft className="size-4" />
            Teams
          </Link>
        </Button>
      }
    >
      {children}
    </NotesWorkspaceShell>
  );
}
