import { ProjectStatus, TaskStatus, TaskPriority } from "@/types";

type BadgeVariant = ProjectStatus | TaskStatus | TaskPriority;

interface BadgeProps {
  variant: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  // Project status
  active:
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  completed:
    "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  "on-hold":
    "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  // Task status
  todo: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  "in-progress":
    "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  done: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  // Task priority
  low: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  medium:
    "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  high: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

const variantLabels: Record<BadgeVariant, string> = {
  active: "Actif",
  completed: "Terminé",
  "on-hold": "En pause",
  todo: "À faire",
  "in-progress": "En cours",
  done: "Terminé",
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
};

export default function Badge({ variant, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {variantLabels[variant]}
    </span>
  );
}
