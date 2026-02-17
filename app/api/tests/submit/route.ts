import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeSrsReview } from "@/lib/srs";

const submitSchema = z.object({
  wordId: z.string().min(1),
  isCorrect: z.boolean()
});


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

    const srsReview = computeSrsReview({
      isCorrect: parsed.data.isCorrect,
      previousRepetitions: currentProgress.repetitions,
      previousInterval: currentProgress.interval,
      previousEaseFactor: currentProgress.easeFactor,
      now
    });

    const masteryLevel = Math.min(
      5,
      Math.max(0, currentProgress.masteryLevel + (parsed.data.isCorrect ? 1 : -1))
    );

    const updatedProgress = await tx.progress.update({
      where: { id: currentProgress.id },
      data: {
        masteryLevel,
        lastReviewedAt: now,
        interval: srsReview.interval,
        easeFactor: srsReview.easeFactor,
        repetitions: srsReview.repetitions,
        nextReviewAt: srsReview.nextReviewAt
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
