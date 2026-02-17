export type SrsReviewInput = {
  isCorrect: boolean;
  previousInterval?: number | null;
  previousEaseFactor?: number | null;
  previousRepetitions?: number | null;
  now?: Date;
};

export type SrsReviewResult = {
  quality: 5 | 2;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: Date;
};

const MIN_EASE_FACTOR = 1.3;
const DAY_IN_MS = 1000 * 60 * 60 * 24;

/**
 * SM-2 Lite scheduler.
 *
 * Future hooks:
 * - userDifficultyScale: adjust interval growth by per-user performance profile
 * - aiDifficultyFactor: apply model-estimated term complexity bias
 * - reminderLeadTime: generate reminder windows before `nextReviewAt`
 * - calendarConstraints: snap scheduling into user-preferred review days
 */
export function computeSrsReview(input: SrsReviewInput): SrsReviewResult {
  const now = input.now ?? new Date();
  const quality: 5 | 2 = input.isCorrect ? 5 : 2;

  const prevInterval = input.previousInterval ?? 1;
  const prevEaseFactor = input.previousEaseFactor ?? 2.5;
  const prevRepetitions = input.previousRepetitions ?? 0;

  let repetitions = prevRepetitions;
  let interval = prevInterval;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (prevRepetitions === 0) {
      interval = 1;
    } else if (prevRepetitions === 1) {
      interval = 6;
    } else {
      interval = Math.max(1, Math.round(prevInterval * prevEaseFactor));
    }

    repetitions = prevRepetitions + 1;
  }

  const easeFactor = Math.max(
    MIN_EASE_FACTOR,
    prevEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReviewAt = new Date(now.getTime() + interval * DAY_IN_MS);

  return {
    quality,
    interval,
    easeFactor,
    repetitions,
    nextReviewAt
  };
}
