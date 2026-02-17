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
    const [globalDistractors, userDistractors] = await Promise.all([
      prisma.word.findMany({
        where: {
          languageId: translation.languageId,
          text: { not: translation.text }
        },
        take: 6,
        orderBy: { createdAt: "desc" }
      }),
      prisma.userWordTranslation.findMany({
        where: {
          translatedLanguageId: translation.languageId,
          translatedText: { not: translation.text },
          userWord: {
            userId: session.user.id
          }
        },
        take: 6,
        orderBy: { id: "desc" }
      })
    ]);

    const distractorPool = [
      ...globalDistractors.map((item) => item.text),
      ...userDistractors.map((item) => item.translatedText)
    ];

    const options = Array.from(new Set([translation.text, ...distractorPool]))
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);

    return NextResponse.json({
      test: {
        type: "mcq",
        wordId: selected.id,
        source: selected.source,
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
      source: selected.source,
      prompt: translation.text,
      answer: selected.text
    }
  });
}
