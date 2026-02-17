import { WordCard } from "@/components/WordCard";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LibraryPage() {
  const session = await getAuthSession();
  const now = new Date();
  const userWordProgress = (prisma as typeof prisma & { userWordProgress?: typeof prisma.progress }).userWordProgress;

  const globalItemsPromise = prisma.progress.findMany({
      where: { userId: session!.user.id },
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
      orderBy: [{ nextReviewAt: "asc" }, { masteryLevel: "asc" }]
    });

  const userItemsPromise = userWordProgress
    ? userWordProgress.findMany({
      where: { userId: session!.user.id },
      include: {
        userWord: {
          include: {
            translations: {
              where: {
                translatedLanguageId: session!.user.nativeLanguageId ?? undefined
              }
            }
          }
        }
      },
      orderBy: [{ nextReviewAt: "asc" }, { masteryLevel: "asc" }]
    })
    : Promise.resolve([]);

  const [globalItems, userItems] = await Promise.all([globalItemsPromise, userItemsPromise]);

  const items = [
    ...globalItems.map((item) => ({
      id: `global-${item.id}`,
      masteryLevel: item.masteryLevel,
      nextReviewAt: item.nextReviewAt,
      word: item.word.text,
      translation: item.word.translationsFrom[0]?.translatedWord.text ?? "-"
    })),
    ...userItems.map((item) => ({
      id: `user-${item.id}`,
      masteryLevel: item.masteryLevel,
      nextReviewAt: item.nextReviewAt,
      word: item.userWord.text,
      translation: item.userWord.translations[0]?.translatedText ?? "-"
    }))
  ].sort((a, b) => {
    const aTime = a.nextReviewAt ? new Date(a.nextReviewAt).getTime() : Number.MAX_SAFE_INTEGER;
    const bTime = b.nextReviewAt ? new Date(b.nextReviewAt).getTime() : Number.MAX_SAFE_INTEGER;

    if (aTime !== bTime) {
      return aTime - bTime;
    }

    return a.masteryLevel - b.masteryLevel;
  });

  const dueToday = items.filter(
    (item) => item.nextReviewAt && new Date(item.nextReviewAt).getTime() <= now.getTime()
  ).length;
  const upcoming = items.filter(
    (item) => item.nextReviewAt && new Date(item.nextReviewAt).getTime() > now.getTime()
  ).length;
  const mastered = items.filter((item) => item.masteryLevel >= 5).length;

  return (
    <section>
      <h1 className="mb-4 text-3xl font-bold">Library</h1>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-3 text-sm">
          <p className="text-slate-500">Due today</p>
          <p className="text-2xl font-semibold text-slate-900">{dueToday}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-3 text-sm">
          <p className="text-slate-500">Upcoming</p>
          <p className="text-2xl font-semibold text-slate-900">{upcoming}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-3 text-sm">
          <p className="text-slate-500">Mastered</p>
          <p className="text-2xl font-semibold text-slate-900">{mastered}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <WordCard key={item.id} word={item.word} translation={item.translation} masteryLevel={item.masteryLevel} />
        ))}
      </div>
    </section>
  );
}
