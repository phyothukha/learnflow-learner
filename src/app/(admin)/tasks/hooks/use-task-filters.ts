import { useState } from "react";
import type { Task, TaskCategory } from "@/store/server/tasks/interface";
import {
  ALL_STATUSES,
  type TaskFiltersProps,
  type TaskStatusFilter,
} from "../components/tasks-toolbar";

export function useTaskFilters(tasks: Task[]) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatusFilter>(ALL_STATUSES);
  const [hiddenCategories, setHiddenCategories] = useState<Set<TaskCategory>>(
    () => new Set(),
  );

  const query = search.trim().toLowerCase();
  const searched = tasks.filter(
    (task) =>
      !query ||
      task.Title.toLowerCase().includes(query) ||
      task.Assignee.Name.toLowerCase().includes(query),
  );
  const visible = searched.filter(
    (task) => !hiddenCategories.has(task.Category),
  );
  const filtered =
    status === ALL_STATUSES
      ? visible
      : visible.filter((task) => task.Status === status);

  const statusCounts = new Map<TaskStatusFilter, number>([
    [ALL_STATUSES, visible.length],
    ...Array.from(
      Map.groupBy(visible, (task) => task.Status),
      ([key, group]) => [key, group.length] as const,
    ),
  ]);
  const categoryCounts = new Map(
    Array.from(
      Map.groupBy(searched, (task) => task.Category),
      ([key, group]) => [key, group.length] as const,
    ),
  );

  const toggleCategory = (category: TaskCategory) =>
    setHiddenCategories((current) => {
      const next = new Set(current);
      if (!next.delete(category)) next.add(category);
      return next;
    });

  const filterProps: TaskFiltersProps = {
    status,
    onStatusChange: setStatus,
    statusCounts,
    search,
    onSearchChange: setSearch,
    hiddenCategories,
    onToggleCategory: toggleCategory,
    onShowAllCategories: () => setHiddenCategories(new Set()),
    categoryCounts,
  };

  return { filtered, filterProps };
}
