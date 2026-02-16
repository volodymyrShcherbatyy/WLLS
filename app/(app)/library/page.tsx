import { WordCard } from "@/components/WordCard";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LibraryPage() {
  const session = await getAuthSession();

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
    orderBy: { masteryLevel: "asc" }
  });

  return (
    <section>
      <h1 className="mb-4 text-3xl font-bold">Library</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <WordCard
            key={item.id}
            word={item.word.text}
            translation={item.word.translationsFrom[0]?.translatedWord.text ?? "-"}
            masteryLevel={item.masteryLevel}
          />
        ))}
      </div>
    </section>
  );
}
