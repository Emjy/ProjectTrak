interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
  showLabel?: boolean;
  color?: string;
}

export default function ProgressBar({
  value,
  className = "",
  showLabel = false,
  color,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const defaultColor =
    clamped === 100
      ? "bg-emerald-500"
      : clamped >= 60
      ? "bg-indigo-500"
      : clamped >= 30
      ? "bg-violet-500"
      : "bg-slate-400";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            color ? "" : defaultColor
          }`}
          style={{
            width: `${clamped}%`,
            backgroundColor: color ?? undefined,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-500 w-9 text-right tabular-nums">
          {clamped}%
        </span>
      )}
    </div>
  );
}
