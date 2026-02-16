import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { getPriorityWords } from "@/lib/learning";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getAuthSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") === "input" ? "input" : "mcq";

  const words = await getPriorityWords(session.user.id, 10);
  const selected = words[0];

  if (!selected || !selected.translationsFrom[0]) {
    return NextResponse.json({ error: "No words available for tests" }, { status: 404 });
  }

  const translation = selected.translationsFrom[0].translatedWord;

  if (type === "mcq") {
    const distractors = await prisma.word.findMany({
      where: {
        languageId: translation.languageId,
        id: { not: translation.id }
      },
      take: 3,
      orderBy: { createdAt: "desc" }
    });

    const options = [translation.text, ...distractors.map((d) => d.text)]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);

    return NextResponse.json({
      test: {
        type: "mcq",
        wordId: selected.id,
        prompt: selected.text,
        answer: translation.text,
        options
      }
    });
  }

  return NextResponse.json({
    test: {
      type: "input",
      wordId: selected.id,
      prompt: translation.text,
      answer: selected.text
    }
  });
}
