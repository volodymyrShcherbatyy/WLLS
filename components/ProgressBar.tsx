interface ProgressBarProps {
  value: number;
  max?: number;
}

export function ProgressBar({ value, max = 5 }: ProgressBarProps) {
  const percent = Math.round((Math.min(value, max) / max) * 100);

  return (
    <div className="w-full">
      <div className="h-2 w-full rounded bg-slate-200">
        <div className="h-2 rounded bg-brand" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-600">{percent}% mastered</p>
    </div>
  );
}
