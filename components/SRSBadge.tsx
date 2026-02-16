interface SRSBadgeProps {
  masteryLevel: number;
  nextReviewAt?: Date | string | null;
}

export function SRSBadge({ masteryLevel, nextReviewAt }: SRSBadgeProps) {
  const nextReviewDate = nextReviewAt ? new Date(nextReviewAt) : null;
  const now = new Date();

  const status =
    masteryLevel >= 5
      ? "Mastered"
      : nextReviewDate && nextReviewDate <= now
        ? "Due"
        : "Learning";

  return (
    <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
      {status}
      {nextReviewDate ? ` · ${nextReviewDate.toLocaleDateString()}` : ""}
    </span>
  );
}
