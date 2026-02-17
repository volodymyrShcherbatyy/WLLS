import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: { id: string; wordId: string } }) {
  const session = await getAuthSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await prisma.$transaction(async (tx) => {
    const list = await tx.customList.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      select: { id: true }
    });

    if (!list) {
      throw new Error("LIST_NOT_FOUND");
    }

    const existing = await tx.customListUserWord.findFirst({
      where: {
        listId: list.id,
        userWordId: params.wordId
      }
    });

    if (!existing) {
      return null;
    }

    return tx.customListUserWord.delete({
      where: { id: existing.id }
    });
  }).catch((error) => {
    if (error instanceof Error && error.message === "LIST_NOT_FOUND") {
      return "LIST_NOT_FOUND" as const;
    }

    throw error;
  });

  if (deleted === "LIST_NOT_FOUND") {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  if (!deleted) {
    return NextResponse.json({ error: "Word not found in list" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
