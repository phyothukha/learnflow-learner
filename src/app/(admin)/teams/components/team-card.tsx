"use client";

import Link from "next/link";
import dayjs from "dayjs";
import {
  AlertTriangle,
  CalendarDays,
  Lock,
  MessageSquareText,
  NotebookPen,
  UsersRound,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { canAccessTeamNotes } from "@/store/client/teams-store";
import type { Team } from "@/store/server/teams/interface";
import { getInitials } from "@/utils/string";

const AVATAR_VISIBLE = 3;

const TAG_STYLES = [
  "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
] as const;

interface TeamCardProps {
  team: Team;
  notesCount?: number;
}

export function TeamCard({ team, notesCount = 0 }: TeamCardProps) {
  const notesAccess = canAccessTeamNotes(team);
  const memberCount = team.Members.length;
  const showAlert = !notesAccess;
  const visibleMembers = team.Members.slice(0, AVATAR_VISIBLE);
  const overflow = Math.max(0, memberCount - AVATAR_VISIBLE);

  return (
    <Link
      href={`/teams/${team.Id}`}
      className={cn(
        "group flex flex-col rounded-2xl bg-card p-5 shadow-[0_10px_40px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] transition-all",
        "hover:-translate-y-0.5 hover:shadow-[0_14px_44px_rgba(15,23,42,0.1)] dark:ring-white/[0.06]",
        !notesAccess && "opacity-90",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white shadow-sm"
            style={{ backgroundColor: team.Color }}
          >
            {team.Name.slice(0, 1).toUpperCase()}
          </span>
          <h2 className="truncate text-[15px] font-semibold tracking-tight">
            {team.Name}
          </h2>
        </div>
        {showAlert ? (
          <AlertTriangle className="size-4 shrink-0 text-rose-500" />
        ) : null}
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {team.Description || "No description yet."}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" />
          {dayjs(team.CreatedAt).format("MMM D, YYYY")}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
            TAG_STYLES[0],
          )}
        >
          <UsersRound className="size-3" />
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </span>
        {notesAccess ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
              TAG_STYLES[2],
            )}
          >
            <NotebookPen className="size-3" />
            Notes available
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
              TAG_STYLES[3],
            )}
          >
            <Lock className="size-3" />
            No notes access
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-border/80 pt-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3 text-xs text-muted-foreground tabular-nums">
          <span className="inline-flex items-center gap-1">
            <NotebookPen className="size-3.5" />
            {notesCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquareText className="size-3.5" />
            {memberCount}
          </span>
        </div>

        <div className="flex shrink-0 items-center -space-x-2">
          {visibleMembers.map((member) => (
            <Avatar
              key={member.LearnerId}
              className="size-7 ring-2 ring-card"
              title={member.Name}
            >
              <AvatarFallback
                className="text-[10px] font-medium text-white"
                style={{ backgroundColor: team.Color }}
              >
                {getInitials(member.Name || member.Email)}
              </AvatarFallback>
            </Avatar>
          ))}
          {overflow > 0 ? (
            <span className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-card">
              +{overflow}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
