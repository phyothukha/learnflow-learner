import {
  LayoutDashboard,
  NotebookPen,
  SquareKanban,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { PERMISSIONS, type PermissionCode } from "@/lib/permissions";

export interface NavLinkItem {
  title: string;
  href: string;
  icon: LucideIcon;
  requiredPermissions: PermissionCode[];
}

export interface NavLinkGroup {
  title?: string;
  items: NavLinkItem[];
}

export const navLinks: NavLinkGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        requiredPermissions: [PERMISSIONS.DASHBOARD_VIEW],
      },
      {
        title: "Tasks",
        href: "/tasks",
        icon: SquareKanban,
        requiredPermissions: [PERMISSIONS.SCHEDULE_VIEW],
      },
      {
        title: "Teams",
        href: "/teams",
        icon: UsersRound,
        // JWT may not include TEAMS_* yet — NOTES_VIEW is enough to browse assigned teams.
        requiredPermissions: [PERMISSIONS.NOTES_VIEW],
      },
      {
        title: "Notes",
        href: "/notes",
        icon: NotebookPen,
        requiredPermissions: [PERMISSIONS.NOTES_VIEW],
      },
    ],
  },
];
