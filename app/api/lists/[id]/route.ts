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
      },
      userWords: {
        include: {
          userWord: {
            include: {
              translations: {
                where: {
                  translatedLanguageId: session.user.nativeLanguageId ?? undefined
                }
              }
            }
          }
        },
        orderBy: {
          userWord: {
            text: "asc"
          }
        }
      }
    }
  });

  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  const items = [
    ...list.listWords.map((item) => ({
      id: item.id,
      source: "global" as const,
      wordId: item.word.id,
      text: item.word.text,
      translation: item.word.translationsFrom[0]?.translatedWord.text ?? "-"
    })),
    ...list.userWords.map((item) => ({
      id: item.id,
      source: "user" as const,
      wordId: item.userWord.id,
      text: item.userWord.text,
      translation: item.userWord.translations[0]?.translatedText ?? "-"
    }))
  ].sort((a, b) => a.text.localeCompare(b.text));

  return NextResponse.json({
    list: {
      id: list.id,
      name: list.name,
      items
    }
  });
}
