import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const list = await prisma.customList.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    include: {
      listWords: {
        include: {
          word: {
            include: {
              language: true,
              translationsFrom: {
                where: {
                  translatedWord: {
                    languageId: session.user.nativeLanguageId ?? undefined
                  }
                },
                include: {
                  translatedWord: true
                }
              }
            }
          }
        },
        orderBy: {
          word: {
            text: "asc"
          }
        }
      }
    }
  });

  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  return NextResponse.json({ list });
}
