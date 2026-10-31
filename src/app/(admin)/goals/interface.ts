export enum GoalPlan {
  Month = "Month",
  Year = "Year",
}

export enum GoalTaskStatus {
  Todo = "Todo",
  Done = "Done",
}

export enum GoalResourceKind {
  Link = "Link",
  File = "File",
  Note = "Note",
}

export enum MilestoneState {
  Achieved = "Achieved",
  InProgress = "InProgress",
  Upcoming = "Upcoming",
}

export interface GoalMilestone {
  Id: string;
  Title: string;
  StartAt: string;
  EndAt: string;
}

export interface GoalTask {
  Id: string;
  Title: string;
  MilestoneId: string | null;
  /** Null while the task is unscheduled. */
  ScheduledAt: string | null;
  Status: GoalTaskStatus;
}

export interface GoalResource {
  Id: string;
  Title: string;
  Kind: GoalResourceKind;
  Description: string;
  Url: string | null;
}

export interface Goal {
  Id: string;
  Name: string;
  Color: string;
  Description: string;
  Category: string;
  Plan: GoalPlan;
  Tags: string[];
  StartAt: string;
  EndAt: string;
  Milestones: GoalMilestone[];
  Tasks: GoalTask[];
  Resources: GoalResource[];
}
