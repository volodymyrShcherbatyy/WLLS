import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await prisma.progress.findMany({
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
  });

  const learned = progress.filter((item) => item.masteryLevel > 0);
  const mastered = progress.filter((item) => item.masteryLevel >= 5);
  const inProgress = progress.filter((item) => item.masteryLevel > 0 && item.masteryLevel < 5);

  return NextResponse.json({ learned, mastered, inProgress });
}
