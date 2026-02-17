import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const customListWithWordsInclude = Prisma.validator<Prisma.CustomListInclude>()({
  listWords: {
    include: {
      word: {
        include: {
          translationsFrom: {
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
  userWordLinks: {
    include: {
      userWord: {
        include: {
          translations: true
        }
      }
    },
    orderBy: {
      userWord: {
        text: "asc"
      }
    }
  }
});

type CustomListWithWords = Prisma.CustomListGetPayload<{
  include: typeof customListWithWordsInclude;
}>;

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
    include: customListWithWordsInclude
  });

  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  const items = mapListItems(list, session.user.nativeLanguageId ?? undefined);

  return NextResponse.json({
    list: {
      id: list.id,
      name: list.name,
      items
    }
  });
}

function mapListItems(list: CustomListWithWords, nativeLanguageId?: string) {
  const globalItems = list.listWords.map((item) => {
    const translation = item.word.translationsFrom.find(
      (entry) => !nativeLanguageId || entry.translatedWord.languageId === nativeLanguageId
    );

    return {
      id: item.id,
      source: "global" as const,
      wordId: item.word.id,
      text: item.word.text,
      translation: translation?.translatedWord.text ?? "-"
    };
  });

  const userItems = list.userWordLinks.map((item) => {
    const translation = item.userWord.translations.find(
      (entry) => !nativeLanguageId || entry.translatedLanguageId === nativeLanguageId
    );

    return {
      id: item.id,
      source: "user" as const,
      wordId: item.userWord.id,
      text: item.userWord.text,
      translation: translation?.translatedText ?? "-"
    };
  });

  return [...globalItems, ...userItems].sort((a, b) => a.text.localeCompare(b.text));
}
