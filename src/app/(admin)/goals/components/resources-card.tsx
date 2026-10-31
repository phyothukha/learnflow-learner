"use client";

import {
  FileText,
  Link2,
  NotebookText,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalResourceKind, type GoalResource } from "../interface";

const KIND_META = new Map<
  GoalResourceKind,
  { icon: LucideIcon; label: string; tint: string }
>([
  [
    GoalResourceKind.Link,
    { icon: Link2, label: "Link", tint: "bg-sky-500/10 text-sky-600" },
  ],
  [
    GoalResourceKind.File,
    {
      icon: NotebookText,
      label: "Course file",
      tint: "bg-emerald-500/10 text-emerald-600",
    },
  ],
  [
    GoalResourceKind.Note,
    {
      icon: FileText,
      label: "Note",
      tint: "bg-violet-500/10 text-violet-600",
    },
  ],
]);

export interface ResourcesCardProps {
  resources: GoalResource[];
  onAdd: () => void;
}

export function ResourcesCard({ resources, onAdd }: ResourcesCardProps) {
  return (
    <Card className="shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">Resources</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary"
          onClick={onAdd}
        >
          <Plus />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        {resources.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No resources yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {resources.map((resource) => {
              const meta = KIND_META.get(resource.Kind)!;
              const Icon = meta.icon;
              return (
                <li
                  key={resource.Id}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${meta.tint}`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {resource.Title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {meta.label} · {resource.Description}
                    </p>
                  </div>
                  {resource.Url && (
                    <a
                      href={resource.Url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Open
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
