import { ProgressBar } from "@/components/ProgressBar";

interface WordCardProps {
  word: string;
  translation: string;
  masteryLevel?: number;
}

export function WordCard({ word, translation, masteryLevel = 0 }: WordCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm">
        <h3 className="min-w-0 flex-1 truncate font-semibold text-slate-900">{word}</h3>
        <span className="text-slate-400">—</span>
        <p className="min-w-0 flex-1 truncate text-right text-slate-600">{translation}</p>
      </div>
      <ProgressBar value={masteryLevel} />
    </div>
  );
}
