import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createWordSchema = z.object({
  languageId: z.string().min(1),
  text: z.string().min(1),
  imageUrl: z.string().url().optional().or(z.literal("")),
  difficulty: z.number().int().min(1).max(5),
  translationWordId: z.string().optional()
});

export async function GET() {
  const words = await prisma.word.findMany({
    include: {
      language: true,
      translationsFrom: {
        include: {
          translatedWord: true
        }
      }
    },
    orderBy: [{ language: { name: "asc" } }, { text: "asc" }]
  });

  return NextResponse.json({ words });
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = createWordSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const word = await prisma.word.create({
    data: {
      languageId: parsed.data.languageId,
      text: parsed.data.text,
      imageUrl: parsed.data.imageUrl || null,
      difficulty: parsed.data.difficulty
    }
  });

  if (parsed.data.translationWordId) {
    await prisma.translation.createMany({
      data: [
        { wordId: word.id, translatedWordId: parsed.data.translationWordId },
        { wordId: parsed.data.translationWordId, translatedWordId: word.id }
      ],
      skipDuplicates: true
    });
  }

  return NextResponse.json({ word }, { status: 201 });
}
