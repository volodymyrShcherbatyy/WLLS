interface MasteryBadgeProps {
  level: number;
}

export function MasteryBadge({ level }: MasteryBadgeProps) {
  const label =
    level >= 5 ? "Mastered" : level >= 3 ? "Learning" : level > 0 ? "New" : "Unseen";

  return (
    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
      {label} · L{level}
    </span>
  );
}
