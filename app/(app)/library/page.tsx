import { WordCard } from "@/components/WordCard";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LibraryPage() {
  const session = await getAuthSession();
  const now = new Date();

  const items = await prisma.progress.findMany({
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
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <WordCard
            key={item.id}
            word={item.word.text}
            translation={item.word.translationsFrom[0]?.translatedWord.text ?? "-"}
            masteryLevel={item.masteryLevel}
            interval={item.interval}
            nextReviewAt={item.nextReviewAt}
          />
        ))}
      </div>
    </section>
  );
}
