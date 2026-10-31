"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  GoalPlan,
  GoalResourceKind,
  type Goal,
  type GoalMilestone,
  type GoalResource,
} from "../interface";

const NO_MILESTONE = "none";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  onSubmit: () => void;
  children: ReactNode;
}

function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  onSubmit,
  children,
}: FormDialogProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {children}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export interface NewGoalInput {
  Name: string;
  Description: string;
  Category: string;
  Plan: GoalPlan;
}

export function NewGoalDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: NewGoalInput) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [plan, setPlan] = useState(GoalPlan.Month);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setName("");
      setDescription("");
      setCategory("");
      setPlan(GoalPlan.Month);
    }
    onOpenChange(next);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="New goal"
      description="Set a target and choose a 1-month or 1-year plan."
      submitLabel="Create goal"
      onSubmit={() => {
        if (!name.trim()) return;
        onCreate({
          Name: name.trim(),
          Description: description.trim(),
          Category: category.trim() || "General",
          Plan: plan,
        });
        handleOpenChange(false);
      }}
    >
      <Field label="Name" htmlFor="goal-name">
        <Input
          id="goal-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Japanese N3"
          autoFocus
        />
      </Field>
      <Field label="Description" htmlFor="goal-description">
        <Textarea
          id="goal-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What does success look like?"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" htmlFor="goal-category">
          <Input
            id="goal-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="e.g. Certification"
          />
        </Field>
        <Field label="Plan" htmlFor="goal-plan">
          <Select
            value={plan}
            onValueChange={(value) => setPlan(value as GoalPlan)}
          >
            <SelectTrigger id="goal-plan" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={GoalPlan.Month}>1 Month plan</SelectItem>
              <SelectItem value={GoalPlan.Year}>1 Year plan</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </FormDialog>
  );
}

export interface AddTaskInput {
  Title: string;
  MilestoneId: string | null;
  ScheduledAt: string | null;
}

export function AddTaskDialog({
  goal,
  open,
  onOpenChange,
  onAdd,
}: {
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (input: AddTaskInput) => void;
}) {
  const [title, setTitle] = useState("");
  const [milestoneId, setMilestoneId] = useState(NO_MILESTONE);
  const [date, setDate] = useState("");

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setTitle("");
      setMilestoneId(NO_MILESTONE);
      setDate("");
    }
    onOpenChange(next);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Add task"
      description={`Add a task to ${goal.Name}. Leave the date empty to schedule it later.`}
      submitLabel="Add task"
      onSubmit={() => {
        if (!title.trim()) return;
        onAdd({
          Title: title.trim(),
          MilestoneId: milestoneId === NO_MILESTONE ? null : milestoneId,
          ScheduledAt: date ? new Date(`${date}T19:00`).toISOString() : null,
        });
        handleOpenChange(false);
      }}
    >
      <Field label="Title" htmlFor="task-title">
        <Input
          id="task-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Milestone" htmlFor="task-milestone">
          <Select value={milestoneId} onValueChange={setMilestoneId}>
            <SelectTrigger id="task-milestone" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_MILESTONE}>No milestone</SelectItem>
              {goal.Milestones.map((milestone) => (
                <SelectItem key={milestone.Id} value={milestone.Id}>
                  {milestone.Title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Date" htmlFor="task-date">
          <Input
            id="task-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>
      </div>
    </FormDialog>
  );
}

export type AddResourceInput = Omit<GoalResource, "Id">;

export function AddResourceDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (input: AddResourceInput) => void;
}) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState(GoalResourceKind.Link);
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setTitle("");
      setKind(GoalResourceKind.Link);
      setDescription("");
      setUrl("");
    }
    onOpenChange(next);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Add resource"
      description="Attach a link, file or note to this goal."
      submitLabel="Add resource"
      onSubmit={() => {
        if (!title.trim()) return;
        onAdd({
          Title: title.trim(),
          Kind: kind,
          Description: description.trim(),
          Url: kind === GoalResourceKind.Link && url.trim() ? url.trim() : null,
        });
        handleOpenChange(false);
      }}
    >
      <Field label="Title" htmlFor="resource-title">
        <Input
          id="resource-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type" htmlFor="resource-kind">
          <Select
            value={kind}
            onValueChange={(value) => setKind(value as GoalResourceKind)}
          >
            <SelectTrigger id="resource-kind" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={GoalResourceKind.Link}>Link</SelectItem>
              <SelectItem value={GoalResourceKind.File}>Course file</SelectItem>
              <SelectItem value={GoalResourceKind.Note}>Note</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {kind === GoalResourceKind.Link && (
          <Field label="URL" htmlFor="resource-url">
            <Input
              id="resource-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://"
            />
          </Field>
        )}
      </div>
      <Field label="Description" htmlFor="resource-description">
        <Input
          id="resource-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
    </FormDialog>
  );
}

export interface MilestoneInput {
  Title: string;
  StartAt: string;
  EndAt: string;
}

const toDateInput = (value: string) => value.slice(0, 10);

/** Adds a milestone, or edits `milestone` when one is given. */
export function MilestoneDialog({
  goal,
  milestone,
  open,
  onOpenChange,
  onSubmit,
}: {
  goal: Goal;
  milestone: GoalMilestone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: MilestoneInput) => void;
}) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(milestone?.Title ?? "");
    setStart(toDateInput(dayjs(milestone?.StartAt ?? goal.StartAt).format()));
    setEnd(toDateInput(dayjs(milestone?.EndAt ?? goal.EndAt).format()));
    setError(null);
  }, [open, milestone, goal.StartAt, goal.EndAt]);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={milestone ? "Edit milestone" : "Add milestone"}
      description={`A step towards ${goal.Name}.`}
      submitLabel={milestone ? "Save changes" : "Add milestone"}
      onSubmit={() => {
        if (!title.trim()) return setError("Name is required.");
        if (!start || !end) return setError("Choose a start and end date.");
        if (dayjs(end).isBefore(start)) {
          return setError("The end date can’t be before the start date.");
        }
        onSubmit({
          Title: title.trim(),
          StartAt: dayjs(start).startOf("day").toISOString(),
          EndAt: dayjs(end).startOf("day").toISOString(),
        });
        onOpenChange(false);
      }}
    >
      <Field label="Name" htmlFor="milestone-title">
        <Input
          id="milestone-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Starts" htmlFor="milestone-start">
          <Input
            id="milestone-start"
            type="date"
            value={start}
            onChange={(event) => setStart(event.target.value)}
          />
        </Field>
        <Field label="Ends" htmlFor="milestone-end">
          <Input
            id="milestone-end"
            type="date"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
          />
        </Field>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </FormDialog>
  );
}
