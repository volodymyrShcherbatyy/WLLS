import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [globalProgress, userWordProgress] = await Promise.all([
    prisma.progress.findMany({
      where: { userId: session.user.id },
      include: {
        word: {
          include: {
            translationsFrom: {
              include: { translatedWord: true }
            }
          }
        }
      }
    }),
    prisma.userWordProgress.findMany({
      where: { userId: session.user.id },
      include: {
        userWord: {
          include: {
            translations: true
          }
        }
      }
    })
  ]);

  const progress = [
    ...globalProgress.map((item) => ({
      id: item.id,
      source: "global" as const,
      masteryLevel: item.masteryLevel,
      nextReviewAt: item.nextReviewAt,
      text: item.word.text,
      translation: item.word.translationsFrom[0]?.translatedWord.text ?? "-"
    })),
    ...userWordProgress.map((item) => ({
      id: item.id,
      source: "user" as const,
      masteryLevel: item.masteryLevel,
      nextReviewAt: item.nextReviewAt,
      text: item.userWord.text,
      translation: item.userWord.translations[0]?.translatedText ?? "-"
    }))
  ];

  const now = new Date();
  const learned = progress.filter((item) => item.masteryLevel > 0);
  const mastered = progress.filter((item) => item.masteryLevel >= 5);
  const inProgress = progress.filter((item) => item.masteryLevel > 0 && item.masteryLevel < 5);
  const dueToday = progress.filter(
    (item) => item.nextReviewAt && new Date(item.nextReviewAt).getTime() <= now.getTime()
  );
  const upcoming = progress.filter(
    (item) => item.nextReviewAt && new Date(item.nextReviewAt).getTime() > now.getTime()
  );

  return NextResponse.json({ all: progress, learned, mastered, inProgress, dueToday, upcoming });
}
