import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const submitSchema = z.object({
  wordId: z.string().min(1),
  isCorrect: z.boolean()
});

const MIN_EASE_FACTOR = 1.3;
const DAY_IN_MS = 1000 * 60 * 60 * 24;

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = submitSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const now = new Date();
  const quality = parsed.data.isCorrect ? 5 : 2;

  const progress = await prisma.$transaction(async (tx) => {
    const currentProgress = await tx.progress.upsert({
      where: {
        userId_wordId: {
          userId: session.user.id,
          wordId: parsed.data.wordId
        }
      },
      update: {},
      create: {
        userId: session.user.id,
        wordId: parsed.data.wordId,
        masteryLevel: 0,
        lastReviewedAt: now,
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0
      }
    });

    const prevRepetitions = currentProgress.repetitions ?? 0;
    const prevInterval = currentProgress.interval ?? 1;
    const prevEaseFactor = currentProgress.easeFactor ?? 2.5;

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

    const masteryLevel = Math.min(
      5,
      Math.max(0, currentProgress.masteryLevel + (parsed.data.isCorrect ? 1 : -1))
    );

    const updatedProgress = await tx.progress.update({
      where: { id: currentProgress.id },
      data: {
        masteryLevel,
        lastReviewedAt: now,
        interval,
        easeFactor,
        repetitions,
        nextReviewAt
      }
    });

    const score = parsed.data.isCorrect ? 1 : 0;

    await tx.testResult.create({
      data: {
        userId: session.user.id,
        score
      }
    });

    return { updatedProgress, score };
  });

  return NextResponse.json({
    success: true,
    score: progress.score,
    masteryLevel: progress.updatedProgress.masteryLevel,
    interval: progress.updatedProgress.interval,
    easeFactor: progress.updatedProgress.easeFactor,
    repetitions: progress.updatedProgress.repetitions,
    nextReviewAt: progress.updatedProgress.nextReviewAt
  });
}
