interface MasteryBadgeProps {
  level: number;
  nextReviewAt?: Date | string | null;
}

export function MasteryBadge({ level, nextReviewAt }: MasteryBadgeProps) {
  const label =
    level >= 5 ? "Mastered" : level >= 3 ? "Learning" : level > 0 ? "New" : "Unseen";

  const reviewDate = nextReviewAt ? new Date(nextReviewAt).toLocaleDateString() : null;

  return (
    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
      {label} · L{level}
      {reviewDate ? ` · Review ${reviewDate}` : ""}
    </span>
  );
}
