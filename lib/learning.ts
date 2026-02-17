import { prisma } from "@/lib/prisma";

export type LearningWord = {
  id: string;
  source: "global" | "user";
  text: string;
  imageUrl: string | null;
  language: {
    id: string;
    code: string;
    name: string;
  };
  progress: {
    id: string;
    userId: string;
    masteryLevel: number;
    interval: number;
    easeFactor: number;
    repetitions: number;
    nextReviewAt: Date | null;
    lastReviewedAt: Date | null;
  }[];
  translationsFrom: {
    translatedWord: {
      id: string;
      text: string;
      languageId: string;
      language: {
        id: string;
        code: string;
        name: string;
      };
    };
  }[];
};

function getReviewDate(progress?: LearningWord["progress"][number]) {
  if (!progress) {
    return 0;
  }

  if (progress.nextReviewAt) {
    return new Date(progress.nextReviewAt).getTime();
  }

  if (progress.lastReviewedAt) {
    return new Date(progress.lastReviewedAt).getTime();
  }

  return 0;
}

export async function getPriorityWords(userId: string, batchSize = 10): Promise<LearningWord[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { nativeLanguageId: true, targetLanguageId: true }
  });

  if (!user?.nativeLanguageId || !user.targetLanguageId) {
    return [];
  }

  const [globalWords, userWords, customListItems, customListUserWordItems] = await Promise.all([
    prisma.word.findMany({
      where: {
        languageId: user.targetLanguageId,
        translationsFrom: {
          some: {
            translatedWord: {
              languageId: user.nativeLanguageId
            }
          }
        }
      },
      include: {
        language: true,
        progress: {
          where: { userId }
        },
        translationsFrom: {
          where: {
            translatedWord: {
              languageId: user.nativeLanguageId
            }
          },
          include: {
            translatedWord: {
              include: {
                language: true
              }
            }
          }
        }
      }
    }),
    prisma.userWord.findMany({
      where: {
        userId,
        languageId: user.targetLanguageId,
        translations: {
          some: {
            translatedLanguageId: user.nativeLanguageId
          }
        }
      },
      include: {
        language: true,
        progress: {
          where: { userId }
        },
        translations: {
          where: {
            translatedLanguageId: user.nativeLanguageId
          },
          include: {
            translatedLanguage: true
          }
        }
      }
    }),
    prisma.customListWord.findMany({
      where: {
        list: {
          userId
        }
      },
      select: {
        wordId: true
      }
    }),
    prisma.customListUserWord.findMany({
      where: {
        list: {
          userId
        }
      },
      select: {
        userWordId: true
      }
    })
  ]);

  const formattedGlobalWords: LearningWord[] = globalWords.map((word) => ({
    id: word.id,
    source: "global",
    text: word.text,
    imageUrl: word.imageUrl,
    language: word.language,
    progress: word.progress,
    translationsFrom: word.translationsFrom.map((translation) => ({
      translatedWord: translation.translatedWord
    }))
  }));

  const formattedUserWords: LearningWord[] = userWords.map((word) => ({
    id: word.id,
    source: "user",
    text: word.text,
    imageUrl: word.imageUrl,
    language: word.language,
    progress: word.progress.map((item) => ({
      id: item.id,
      userId: item.userId,
      masteryLevel: item.masteryLevel,
      interval: item.interval,
      easeFactor: item.easeFactor,
      repetitions: item.repetitions,
      nextReviewAt: item.nextReviewAt,
      lastReviewedAt: item.lastReviewedAt
    })),
    translationsFrom: word.translations.map((translation) => ({
      translatedWord: {
        id: `uwt-${translation.id}`,
        text: translation.translatedText,
        languageId: translation.translatedLanguageId,
        language: translation.translatedLanguage
      }
    }))
  }));

  const words = [...formattedGlobalWords, ...formattedUserWords];
  const now = Date.now();

  const customListKeys = new Set([
    ...customListItems.map((item) => `global:${item.wordId}`),
    ...customListUserWordItems.map((item) => `user:${item.userWordId}`)
  ]);

  return words
    .sort((a, b) => {
      const isCustomA = customListKeys.has(`${a.source}:${a.id}`) ? 0 : 1;
      const isCustomB = customListKeys.has(`${b.source}:${b.id}`) ? 0 : 1;
      if (isCustomA !== isCustomB) {
        return isCustomA - isCustomB;
      }

      const progressA = a.progress[0];
      const progressB = b.progress[0];

      const dueA = progressA?.nextReviewAt && new Date(progressA.nextReviewAt).getTime() <= now ? 0 : 1;
      const dueB = progressB?.nextReviewAt && new Date(progressB.nextReviewAt).getTime() <= now ? 0 : 1;
      if (dueA !== dueB) {
        return dueA - dueB;
      }

      const isNewA = progressA ? 1 : 0;
      const isNewB = progressB ? 1 : 0;
      if (isNewA !== isNewB) {
        return isNewA - isNewB;
      }

      const masteryA = progressA?.masteryLevel ?? 0;
      const masteryB = progressB?.masteryLevel ?? 0;
      if (masteryA !== masteryB) {
        return masteryA - masteryB;
      }

      return getReviewDate(progressA) - getReviewDate(progressB);
    })
    .slice(0, batchSize);
}
