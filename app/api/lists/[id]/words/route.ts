import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const addWordSchema = z.object({
  wordId: z.string().min(1)
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = addWordSchema.safeParse(payload);

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

      const word = await tx.word.findUnique({
        where: {
          id: parsed.data.wordId
        }
      });

      if (!word) {
        throw new Error("WORD_NOT_FOUND");
      }

      await tx.customListWord.upsert({
        where: {
          listId_wordId: {
            listId: list.id,
            wordId: word.id
          }
        },
        update: {},
        create: {
          listId: list.id,
          wordId: word.id
        }
      });

      return { listId: list.id, wordId: word.id };
    });

    return NextResponse.json({ item: result }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "LIST_NOT_FOUND") {
        return NextResponse.json({ error: "List not found" }, { status: 404 });
      }

      if (error.message === "WORD_NOT_FOUND") {
        return NextResponse.json({ error: "Word not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ error: "Failed to add word to list" }, { status: 500 });
  }
}
