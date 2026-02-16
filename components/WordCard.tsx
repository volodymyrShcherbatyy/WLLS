import { MasteryBadge } from "@/components/MasteryBadge";
import { ProgressBar } from "@/components/ProgressBar";

interface WordCardProps {
  word: string;
  translation: string;
  masteryLevel?: number;
}

export function WordCard({ word, translation, masteryLevel = 0 }: WordCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{word}</h3>
        <MasteryBadge level={masteryLevel} />
      </div>
      <p className="text-slate-600">{translation}</p>
      <div className="mt-3">
        <ProgressBar value={masteryLevel} />
      </div>
    </div>
  );
}
