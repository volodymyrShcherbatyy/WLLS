import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type LearningWord = Prisma.WordGetPayload<{
  include: {
    progress: true;
    language: true;
    translationsFrom: {
      include: {
        translatedWord: {
          include: {
            language: true;
          };
        };
      };
    };
  };
}>;

export async function getPriorityWords(userId: string, batchSize = 10) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { nativeLanguageId: true, targetLanguageId: true }
  });

  if (!user?.nativeLanguageId || !user.targetLanguageId) {
    return [];
  }

  const words = await prisma.word.findMany({
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
  });

  return words
    .sort((a, b) => {
      const progressA = a.progress[0];
      const progressB = b.progress[0];

      const masteryA = progressA?.masteryLevel ?? 0;
      const masteryB = progressB?.masteryLevel ?? 0;
      if (masteryA !== masteryB) {
        return masteryA - masteryB;
      }

      const neverReviewedA = progressA?.lastReviewedAt ? 1 : 0;
      const neverReviewedB = progressB?.lastReviewedAt ? 1 : 0;
      if (neverReviewedA !== neverReviewedB) {
        return neverReviewedA - neverReviewedB;
      }

      const reviewedAtA = progressA?.lastReviewedAt ? new Date(progressA.lastReviewedAt).getTime() : 0;
      const reviewedAtB = progressB?.lastReviewedAt ? new Date(progressB.lastReviewedAt).getTime() : 0;

      return reviewedAtA - reviewedAtB;
    })
    .slice(0, batchSize);
}
