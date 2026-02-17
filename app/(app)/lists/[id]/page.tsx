"use client";

import { useCallback, useEffect, useState } from "react";

import { AddWordToListModal } from "@/components/AddWordToListModal";

type ListItem = {
  id: string;
  source: "global" | "user";
  wordId: string;
  text: string;
  translation: string;
};

type ListDetails = {
  id: string;
  name: string;
  items: ListItem[];
};

export default function ListDetailsPage({ params }: { params: { id: string } }) {
  const [list, setList] = useState<ListDetails | null>(null);

  const loadList = useCallback(async () => {
    const response = await fetch(`/api/lists/${params.id}`);
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setList(data.list);
  }, [params.id]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const addWord = async ({ text, translation, imageUrl }: { text: string; translation: string; imageUrl?: string }) => {
    await fetch(`/api/lists/${params.id}/user-words`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, translation, imageUrl })
    });
    await loadList();
  };

  const removeWord = async (source: "global" | "user", wordId: string) => {
    if (source === "global") {
      await fetch(`/api/lists/${params.id}/words/${wordId}`, {
        method: "DELETE"
      });
    } else {
      await fetch(`/api/lists/${params.id}/user-words/${wordId}`, {
        method: "DELETE"
      });
    }

    await loadList();
  };

  if (!list) {
    return <section>Loading list...</section>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{list.name}</h1>
        <AddWordToListModal onAdd={addWord} />
      </div>

      <div className="grid gap-3">
        {list.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <p className="font-semibold">{item.text}</p>
              <p className="text-sm text-slate-600">Translation: {item.translation}</p>
            </div>
            <button
              type="button"
              onClick={() => removeWord(item.source, item.wordId)}
              className="rounded border border-rose-300 px-3 py-2 text-sm text-rose-700"
            >
              Remove
            </button>
          </div>
        ))}
        {list.items.length === 0 && <p className="text-sm text-slate-600">No words in this list yet.</p>}
      </div>
    </section>
  );
}
