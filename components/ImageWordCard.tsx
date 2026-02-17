import Image from "next/image";

interface ImageWordCardProps {
  text: string;
  imageUrl?: string | null;
  description?: string;
  translation?: string;
}

export function ImageWordCard({ text, imageUrl, description, translation }: ImageWordCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {imageUrl ? (
        <Image src={imageUrl} alt={description || text} width={640} height={320} className="h-48 w-full object-cover" />
      ) : (
        <div className="flex h-48 items-center justify-center bg-slate-100 text-slate-500">No image</div>
      )}
      <div className="space-y-2 p-4">
        <h3 className="text-xl font-semibold">{text}</h3>
          {description && translation && (
            <p className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span>&gt;&gt;&gt;</span>
              <span className="font-medium">{translation}</span>
            </p>
          )}        
      </div>
    </article>
  );
}
