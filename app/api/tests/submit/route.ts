import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const progress = await prisma.progress.upsert({
    where: {
      userId_wordId: {
        userId: session.user.id,
        wordId: parsed.data.wordId
      }
    },
    update: {
      masteryLevel: {
        increment: parsed.data.isCorrect ? 1 : 0
      },
      lastReviewedAt: new Date()
    },
    create: {
      userId: session.user.id,
      wordId: parsed.data.wordId,
      masteryLevel: parsed.data.isCorrect ? 1 : 0,
      lastReviewedAt: new Date()
    }
  });

  const clampedMastery = Math.min(progress.masteryLevel, 5);
  if (clampedMastery !== progress.masteryLevel) {
    await prisma.progress.update({ where: { id: progress.id }, data: { masteryLevel: clampedMastery } });
  }

  const score = parsed.data.isCorrect ? 1 : 0;

  await prisma.testResult.create({
    data: {
      userId: session.user.id,
      score
    }
  });

  return NextResponse.json({ success: true, score, masteryLevel: clampedMastery });
}
