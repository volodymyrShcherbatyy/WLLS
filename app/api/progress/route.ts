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
        include: { language: true }
      }
    },
    orderBy: [{ nextReviewAt: "asc" }, { masteryLevel: "asc" }, { lastReviewedAt: "asc" }]
  });

  return NextResponse.json({ progress });
}
