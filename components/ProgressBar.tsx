interface ProgressBarProps {
  value: number;
  max?: number;
  intervalDays?: number;
  nextReviewAt?: Date | string | null;
}

export function ProgressBar({ value, max = 5, intervalDays, nextReviewAt }: ProgressBarProps) {
  const percent = Math.round((Math.min(value, max) / max) * 100);
  const reviewDate = nextReviewAt ? new Date(nextReviewAt).toLocaleDateString() : null;

  return (
    <div className="w-full">
      <div className="h-2 w-full rounded bg-slate-200">
        <div className="h-2 rounded bg-brand" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-600">{percent}% mastered</p>
      {(intervalDays || reviewDate) && (
        <p className="mt-1 text-xs text-slate-500">
          {intervalDays ? `Interval: ${intervalDays} day${intervalDays === 1 ? "" : "s"}` : ""}
          {intervalDays && reviewDate ? " · " : ""}
          {reviewDate ? `Next review: ${reviewDate}` : ""}
        </p>
      )}
    </div>
  );
}
