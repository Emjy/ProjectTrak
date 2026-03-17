import { Project, Task } from "@/types";

export const mockProjects: Project[] = [
  {
    id: "proj-1",
    name: "Website Redesign",
    description:
      "Complete overhaul of the company website with a modern design system, improved UX, and performance optimizations.",
    status: "active",
    color: "#6366f1",
    dueDate: "2026-04-15",
    teamIds: [],
    createdAt: "2026-01-10",
  },
  {
    id: "proj-2",
    name: "Mobile App MVP",
    description:
      "Build the first version of our iOS and Android app using React Native, covering core user flows and authentication.",
    status: "active",
    color: "#8b5cf6",
    dueDate: "2026-05-30",
    teamIds: [],
    createdAt: "2026-02-01",
  },
  {
    id: "proj-3",
    name: "API Integration",
    description:
      "Integrate third-party payment and analytics APIs into the existing backend infrastructure.",
    status: "on-hold",
    color: "#06b6d4",
    dueDate: "2026-03-01",
    teamIds: [],
    createdAt: "2026-01-20",
  },
];

export const mockTasks: Task[] = [
  // Website Redesign tasks
  {
    id: "task-1",
    projectId: "proj-1",
    title: "Design new component library",
    status: "done",
    priority: "high",
    dueDate: "2026-02-28",
    assigneeIds: [],
  },
  {
    id: "task-2",
    projectId: "proj-1",
    title: "Implement responsive homepage",
    status: "in-progress",
    priority: "high",
    dueDate: "2026-03-20",
    assigneeIds: [],
  },
  {
    id: "task-3",
    projectId: "proj-1",
    title: "Write content for About page",
    status: "todo",
    priority: "medium",
    dueDate: "2026-03-25",
    assigneeIds: [],
  },
  {
    id: "task-4",
    projectId: "proj-1",
    title: "SEO audit and metadata setup",
    status: "todo",
    priority: "low",
    dueDate: "2026-04-10",
    assigneeIds: [],
  },

  // Mobile App MVP tasks
  {
    id: "task-5",
    projectId: "proj-2",
    title: "Set up React Native project",
    status: "done",
    priority: "high",
    dueDate: "2026-02-10",
    assigneeIds: [],
  },
  {
    id: "task-6",
    projectId: "proj-2",
    title: "Build authentication flow",
    status: "done",
    priority: "high",
    dueDate: "2026-02-20",
    assigneeIds: [],
  },
  {
    id: "task-7",
    projectId: "proj-2",
    title: "Design dashboard screens",
    status: "in-progress",
    priority: "high",
    dueDate: "2026-03-15",
    assigneeIds: [],
  },
  {
    id: "task-8",
    projectId: "proj-2",
    title: "Integrate push notifications",
    status: "todo",
    priority: "medium",
    dueDate: "2026-04-01",
    assigneeIds: [],
  },
  {
    id: "task-9",
    projectId: "proj-2",
    title: "Write unit tests",
    status: "todo",
    priority: "low",
    dueDate: "2026-05-01",
    assigneeIds: [],
  },

  // API Integration tasks
  {
    id: "task-10",
    projectId: "proj-3",
    title: "Research Stripe API",
    status: "done",
    priority: "high",
    dueDate: "2026-01-30",
    assigneeIds: [],
  },
  {
    id: "task-11",
    projectId: "proj-3",
    title: "Implement payment webhook handler",
    status: "in-progress",
    priority: "high",
    dueDate: "2026-02-15",
    assigneeIds: [],
  },
  {
    id: "task-12",
    projectId: "proj-3",
    title: "Set up analytics event tracking",
    status: "todo",
    priority: "medium",
    dueDate: "2026-02-28",
    assigneeIds: [],
  },
];
