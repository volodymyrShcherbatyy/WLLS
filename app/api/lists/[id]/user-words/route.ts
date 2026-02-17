import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const addUserWordSchema = z.object({
  text: z.string().trim().min(1),
  translation: z.string().trim().min(1),
  imageUrl: z.string().url().optional().or(z.literal(""))
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.targetLanguageId || !session.user.nativeLanguageId) {
    return NextResponse.json({ error: "Language pair is not configured" }, { status: 400 });
  }

  const payload = await request.json();
  const parsed = addUserWordSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const list = await tx.customList.findFirst({
        where: {
          id: params.id,
          userId: session.user.id
        }
      });

      if (!list) {
        throw new Error("LIST_NOT_FOUND");
      }

      const userWord = await tx.userWord.create({
        data: {
          userId: session.user.id,
          languageId: session.user.targetLanguageId!,
          text: parsed.data.text.trim(),
          imageUrl: parsed.data.imageUrl || null
        }
      });

      await tx.userWordTranslation.create({
        data: {
          userWordId: userWord.id,
          translatedText: parsed.data.translation.trim(),
          translatedLanguageId: session.user.nativeLanguageId!
        }
      });

      await tx.customListUserWord.create({
        data: {
          listId: list.id,
          userWordId: userWord.id
        }
      });

      return userWord;
    });

    return NextResponse.json({ item: result }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "LIST_NOT_FOUND") {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to add user word to list" }, { status: 500 });
  }
}
