import { ImageWordCard } from "@/components/ImageWordCard";
import { getAuthSession } from "@/lib/auth";
import { getPriorityWords } from "@/lib/learning";

export default async function LearnPage() {
  const session = await getAuthSession();
  const words = await getPriorityWords(session!.user.id, 10);

  return (
    <section>
      <h1 className="mb-4 text-3xl font-bold">Learn words</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {words.map((word) => (
          <div key={word.id}>
            <ImageWordCard
              text={word.text}
              imageUrl={word.imageUrl}
              description={`${}`}
              translation={word.translationsFrom[0]?.translatedWord.text ?? "-"}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
