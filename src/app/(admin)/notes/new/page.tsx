"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownSplitEditor } from "@/components/markdown-split-editor";
import { usePermission } from "@/hooks/use-permission";
import { useWorkspaceNotesHydration } from "@/hooks/use-workspace-notes-hydration";
import { PERMISSIONS } from "@/lib/permissions";
import { useNotesStore } from "@/store/client/notes-store";
import { CURRENT_USER_ID } from "@/store/client/teams-store";
import { NoteVisibility } from "@/store/server/notes/interface";

export default function NewNotePage() {
  const router = useRouter();
  const { status } = useSession();
  const { hasPermission } = usePermission();
  const canCreate = hasPermission(PERMISSIONS.NOTES_CREATE);
  const ready = useWorkspaceNotesHydration();
  const createNote = useNotesStore((state) => state.createNote);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (status === "authenticated" && !canCreate) router.replace("/forbidden");
  }, [status, canCreate, router]);

  if (status !== "authenticated" || !canCreate || !ready) return null;

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    const id = createNote({
      Title: title.trim(),
      Content: content.trim() || null,
      Visibility: NoteVisibility.Private,
      TeamId: null,
      OwnerId: CURRENT_USER_ID,
      OwnerName: "You",
    });
    toast.success("Private note created.");
    router.push(`/notes/${id}`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="icon" className="size-9" asChild>
            <Link href="/notes">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              New private note
            </h1>
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Lock className="size-3.5" />
              Only you can see this. Team notes are created from Teams.
            </p>
          </div>
        </div>
        <Button onClick={handleCreate}>Create note</Button>
      </div>

      <div className="shrink-0 space-y-2">
        <Label htmlFor="note-title">Title</Label>
        <Input
          id="note-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
        />
      </div>

      <div className="library-card min-h-0 flex-1 overflow-hidden p-0">
        <MarkdownSplitEditor
          className="h-full border-0"
          value={content}
          onChange={setContent}
        />
      </div>
    </div>
  );
}
