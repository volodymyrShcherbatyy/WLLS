import { MasteryBadge } from "@/components/MasteryBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { SRSBadge } from "@/components/SRSBadge";

interface WordCardProps {
  word: string;
  translation: string;
  masteryLevel?: number;
  interval?: number;
  nextReviewAt?: Date | string | null;
}

export function WordCard({
  word,
  translation,
  masteryLevel = 0,
  interval,
  nextReviewAt
}: WordCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-900">{word}</h3>
        <MasteryBadge level={masteryLevel} nextReviewAt={nextReviewAt} />
      </div>
      <p className="text-slate-600">{translation}</p>
      <div className="mt-2">
        <SRSBadge masteryLevel={masteryLevel} nextReviewAt={nextReviewAt} />
      </div>
      <div className="mt-3">
        <ProgressBar value={masteryLevel} intervalDays={interval} nextReviewAt={nextReviewAt} />
      </div>
    </div>
  );
}
