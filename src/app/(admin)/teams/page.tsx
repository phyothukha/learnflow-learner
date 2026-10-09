"use client";

import { useMemo } from "react";
import { UsersRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useWorkspaceNotesHydration } from "@/hooks/use-workspace-notes-hydration";
import { PERMISSIONS } from "@/lib/permissions";
import { useRequirePermission } from "@/hooks/use-require-permission";
import { useNotesStore } from "@/store/client/notes-store";
import { isTeamMember, useTeamsStore } from "@/store/client/teams-store";
import { NoteVisibility } from "@/store/server/notes/interface";
import { TeamCard } from "./components/team-card";

export default function TeamsPage() {
  const canView = useRequirePermission(PERMISSIONS.TEAMS_VIEW);
  const ready = useWorkspaceNotesHydration();
  const teams = useTeamsStore((state) => state.teams);
  const notes = useNotesStore((state) => state.notes);

  const notesByTeam = useMemo(() => {
    const map = new Map<string, number>();
    for (const note of notes) {
      if (note.Visibility !== NoteVisibility.Team || !note.TeamId) continue;
      map.set(note.TeamId, (map.get(note.TeamId) ?? 0) + 1);
    }
    return map;
  }, [notes]);

  if (!canView || !ready) return null;

  const mine = teams.filter((team) => isTeamMember(team));

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <PageHeader
        title="Your teams"
        description="Open a team to work with shared notes. Private notes stay in Notes."
      />

      {mine.length === 0 ? (
        <div className="library-card flex flex-col items-center gap-2 px-4 py-14 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
            <UsersRound className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No teams yet</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            An admin must add you to a team before it appears here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mine.map((team) => (
            <TeamCard
              key={team.Id}
              team={team}
              notesCount={notesByTeam.get(team.Id) ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
