import Link from "next/link";

interface CustomListCardProps {
  id: string;
  name: string;
  wordCount: number;
}

export function CustomListCard({ id, name, wordCount }: CustomListCardProps) {
  return (
    <Link
      href={`/lists/${id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand"
    >
      <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
      <p className="mt-2 text-sm text-slate-600">Words in list: {wordCount}</p>
    </Link>
  );
}
