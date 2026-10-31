import dayjs from "dayjs";
import {
  GoalPlan,
  GoalResourceKind,
  GoalTaskStatus,
  type Goal,
  type GoalMilestone,
  type GoalTask,
} from "../interface";

const { Done, Todo } = GoalTaskStatus;

/** Offsets are in days from today so the sample data always looks current. */
function at(offset: number, time = "19:00") {
  const [hour, minute] = time.split(":").map(Number);
  return dayjs()
    .startOf("day")
    .add(offset, "day")
    .hour(hour)
    .minute(minute)
    .toISOString();
}

function day(offset: number) {
  return dayjs().startOf("day").add(offset, "day").toISOString();
}

function milestones(
  prefix: string,
  items: [title: string, from: number, to: number][],
): GoalMilestone[] {
  return items.map(([Title, from, to], index) => ({
    Id: `${prefix}-m${index + 1}`,
    Title,
    StartAt: day(from),
    EndAt: day(to),
  }));
}

function tasks(
  prefix: string,
  items: [
    title: string,
    milestone: number | null,
    offset: number | null,
    status: GoalTaskStatus,
  ][],
): GoalTask[] {
  return items.map(([Title, milestone, offset, Status], index) => ({
    Id: `${prefix}-t${index + 1}`,
    Title,
    MilestoneId: milestone === null ? null : `${prefix}-m${milestone}`,
    ScheduledAt: offset === null ? null : at(offset),
    Status,
  }));
}

export function createFakeGoals(): Goal[] {
  return [
    {
      Id: "goal-n3",
      Name: "Japanese N3",
      Color: "#3b82f6",
      Description: "Reach JLPT N3 reading and listening level.",
      Category: "Language",
      Plan: GoalPlan.Year,
      Tags: ["JLPT", "Japanese"],
      StartAt: day(-90),
      EndAt: day(275),
      Milestones: milestones("n3", [
        ["N4 review", -90, -30],
        ["N4 grammar & 300 kanji", 17, 105],
        ["N3 grammar", 106, 200],
        ["Mock exams", 201, 275],
      ]),
      Tasks: tasks("n3", [
        ["Kanji flashcards", 2, 0, Todo],
        ["Grammar workbook ch. 3", 2, 3, Todo],
        ["Listening drill", 1, -10, Done],
        ["Find a language partner", null, null, Todo],
      ]),
      Resources: [
        {
          Id: "n3-r1",
          Title: "JLPT official sample questions",
          Kind: GoalResourceKind.Link,
          Description: "Past N3 papers with audio",
          Url: "https://www.jlpt.jp/e/samples/sampleindex.html",
        },
      ],
    },
    {
      Id: "goal-fe",
      Name: "ITPEC FE Certification",
      Color: "#10b981",
      Description: "Pass the ITPEC Fundamental IT Engineer exam.",
      Category: "Certification",
      Plan: GoalPlan.Month,
      Tags: ["Exam", "IT"],
      StartAt: day(-13),
      EndAt: day(16),
      Milestones: milestones("fe", [
        ["Technology basics", -13, -7],
        ["Networks & databases", -6, 1],
        ["Security & management", 2, 8],
        ["Past papers", 9, 16],
      ]),
      Tasks: tasks("fe", [
        ["Computer systems review", 1, -12, Done],
        ["Algorithms exercises", 1, -10, Done],
        ["Data structures notes", 1, -9, Done],
        ["Basic theory quiz", 1, -8, Done],
        ["Networking ports review", 2, -4, Done],
        ["Database normalization drills", 2, -2, Todo],
        ["FE past paper", 2, 0, Todo],
        ["SQL practice set", 2, 1, Todo],
        ["Security fundamentals quiz", 3, 2, Todo],
        ["Project management notes", 3, 4, Todo],
        ["Timed practice exam", 3, 4, Todo],
        ["Security case studies", 3, 6, Todo],
        ["Past paper 2023 A", 4, 9, Todo],
        ["Past paper 2023 B", 4, 11, Todo],
        ["Past paper 2022 A", 4, 13, Todo],
        ["Past paper 2022 B", 4, 14, Todo],
        ["Download the latest past paper", null, null, Todo],
      ]),
      Resources: [
        {
          Id: "fe-r1",
          Title: "ITPEC past exam papers",
          Kind: GoalResourceKind.Link,
          Description: "Official past questions and answers",
          Url: "https://www.itpec.org/",
        },
        {
          Id: "fe-r2",
          Title: "FE syllabus notes — Networks",
          Kind: GoalResourceKind.File,
          Description: "OSI layers, ports, IP addressing",
          Url: null,
        },
        {
          Id: "fe-r3",
          Title: "Personal FE weak topics",
          Kind: GoalResourceKind.Note,
          Description: "Data structures, ports, security",
          Url: null,
        },
      ],
    },
    {
      Id: "goal-workout",
      Name: "Daily Workout",
      Color: "#f59e0b",
      Description: "Build a steady daily exercise habit.",
      Category: "Health",
      Plan: GoalPlan.Month,
      Tags: ["Fitness"],
      StartAt: day(-20),
      EndAt: day(9),
      Milestones: milestones("wo", [
        ["Warm-up habit", -20, 0],
        ["Sustain", 1, 9],
      ]),
      Tasks: tasks("wo", [
        ["Run 5 km", 1, 0, Done],
        ["Stretching routine", 1, 1, Todo],
        ["Strength session", 2, 3, Todo],
      ]),
      Resources: [],
    },
    {
      Id: "goal-coursework",
      Name: "Semester coursework",
      Color: "#8b5cf6",
      Description: "Finish every assignment before the semester ends.",
      Category: "Study",
      Plan: GoalPlan.Month,
      Tags: ["University"],
      StartAt: day(-10),
      EndAt: day(20),
      Milestones: milestones("co", [
        ["Assignments", -10, 8],
        ["Project", 9, 20],
      ]),
      Tasks: tasks("co", [
        ["Project demo prep", 1, 0, Todo],
        ["Math revision", 1, 0, Todo],
        ["Peer tutoring", 1, 0, Todo],
        ["Lab report", 1, -3, Done],
        ["Essay outline", 1, -6, Done],
        ["Statistics set", 1, -4, Done],
        ["Group project draft", 2, 12, Todo],
        ["Final presentation", 2, 18, Todo],
        ["Reading list", null, null, Todo],
      ]),
      Resources: [],
    },
  ];
}
