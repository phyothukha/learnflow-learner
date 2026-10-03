"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowUpRight, Lock, NotebookPen, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { usePermission } from "@/hooks/use-permission";
import { useWorkspaceNotesHydration } from "@/hooks/use-workspace-notes-hydration";
import { PERMISSIONS } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import {
  canAccessTeamNotes,
  isTeamMember,
  useTeamsStore,
} from "@/store/client/teams-store";

export default function TeamsPage() {
  const router = useRouter();
  const { status } = useSession();
  const { hasPermission } = usePermission();
  const canView = hasPermission(PERMISSIONS.NOTES_VIEW);
  const ready = useWorkspaceNotesHydration();
  const teams = useTeamsStore((state) => state.teams);

  useEffect(() => {
    if (status === "authenticated" && !canView) router.replace("/forbidden");
  }, [status, canView, router]);

  if (status !== "authenticated" || !canView || !ready) return null;

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
          {mine.map((team) => {
            const notesAccess = canAccessTeamNotes(team);
            return (
              <Link
                key={team.Id}
                href={`/teams/${team.Id}`}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-xs transition-all",
                  "hover:border-primary/30 hover:shadow-md",
                )}
              >
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: team.Color }}
                />
                <div className="flex items-start gap-3">
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white shadow-sm"
                    style={{ backgroundColor: team.Color }}
                  >
                    {team.Name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-semibold tracking-tight">
                        {team.Name}
                      </p>
                      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    {team.Description && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {team.Description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  {notesAccess ? (
                    <Badge variant="status-green" className="gap-1 font-normal">
                      <NotebookPen className="size-3" />
                      Notes available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 font-normal">
                      <Lock className="size-3" />
                      No notes access
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
