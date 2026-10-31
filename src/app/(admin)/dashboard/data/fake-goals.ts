import dayjs from "dayjs";

export interface DashboardGoal {
  Id: string;
  Name: string;
  Color: string;
  Plan: string;
  DoneTasks: number;
  TotalTasks: number;
  DueAt: string;
}

export interface DashboardMilestone {
  Id: string;
  Title: string;
  GoalName: string;
  Color: string;
  StartAt: string;
  EndAt: string;
}

export function createFakeGoals(): DashboardGoal[] {
  const today = dayjs().startOf("day");
  return [
    {
      Id: "goal-n3",
      Name: "Japanese N3",
      Color: "#3b82f6",
      Plan: "1 Year plan",
      DoneTasks: 9,
      TotalTasks: 32,
      DueAt: today.add(9, "month").toISOString(),
    },
    {
      Id: "goal-fe",
      Name: "ITPEC FE Certification",
      Color: "#10b981",
      Plan: "1 Month plan",
      DoneTasks: 5,
      TotalTasks: 17,
      DueAt: today.add(16, "day").toISOString(),
    },
    {
      Id: "goal-workout",
      Name: "Daily Workout",
      Color: "#f59e0b",
      Plan: "1 Month plan",
      DoneTasks: 10,
      TotalTasks: 30,
      DueAt: today.add(9, "day").toISOString(),
    },
    {
      Id: "goal-coursework",
      Name: "Semester coursework",
      Color: "#8b5cf6",
      Plan: "1 Month plan",
      DoneTasks: 4,
      TotalTasks: 9,
      DueAt: today.add(20, "day").toISOString(),
    },
  ];
}

export function createFakeMilestones(): DashboardMilestone[] {
  const today = dayjs().startOf("day");
  return [
    {
      Id: "ms-networks",
      Title: "Networks & databases",
      GoalName: "ITPEC FE Certification",
      Color: "#10b981",
      StartAt: today.subtract(6, "day").toISOString(),
      EndAt: today.add(1, "day").toISOString(),
    },
    {
      Id: "ms-sustain",
      Title: "Sustain",
      GoalName: "Daily Workout",
      Color: "#f59e0b",
      StartAt: today.add(1, "day").toISOString(),
      EndAt: today.add(9, "day").toISOString(),
    },
    {
      Id: "ms-kanji",
      Title: "N4 grammar & 300 kanji",
      GoalName: "Japanese N3",
      Color: "#3b82f6",
      StartAt: today.add(17, "day").toISOString(),
      EndAt: today.add(3, "month").toISOString(),
    },
  ];
}
