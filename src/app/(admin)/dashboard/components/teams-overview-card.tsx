"use client";

import Link from "next/link";
import { Lock, NotebookPen, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { canAccessTeamNotes } from "@/store/client/teams-store";
import type { Team } from "@/store/server/teams/interface";
import { WidgetHeader } from "./widget-header";

export function TeamsOverviewCard({ teams }: { teams: Team[] }) {
  return (
    <Card className="shadow-xs">
      <WidgetHeader title="Your teams" href="/teams" linkLabel="View all" />
      <CardContent>
        {teams.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <UsersRound className="size-6" />
            <p className="text-center text-sm">
              You’re not in any team yet. An admin must add you.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {teams.slice(0, 4).map((team) => {
              const notesAccess = canAccessTeamNotes(team);
              return (
                <li key={team.Id}>
                  <Link
                    href={`/teams/${team.Id}`}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/40"
                  >
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold text-white"
                      style={{ backgroundColor: team.Color }}
                    >
                      {team.Name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {team.Name}
                      </span>
                      {team.Description && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {team.Description}
                        </span>
                      )}
                    </span>
                    {notesAccess ? (
                      <Badge
                        variant="status-green"
                        className="gap-1 font-normal"
                      >
                        <NotebookPen className="size-3" />
                        Notes
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 font-normal">
                        <Lock className="size-3" />
                        No notes
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {teams.length > 4 && (
          <Button variant="ghost" size="sm" className="mt-3 w-full" asChild>
            <Link href="/teams">+{teams.length - 4} more teams</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
