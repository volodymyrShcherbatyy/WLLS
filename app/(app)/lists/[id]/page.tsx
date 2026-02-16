"use client";

import { useEffect, useMemo, useState } from "react";

import { AddWordToListModal } from "@/components/AddWordToListModal";

type ListWord = {
  id: string;
  word: {
    id: string;
    text: string;
    language: {
      name: string;
    };
    translationsFrom: {
      translatedWord: {
        text: string;
      };
    }[];
  };
};

type ListDetails = {
  id: string;
  name: string;
  listWords: ListWord[];
};

type WordOption = {
  id: string;
  text: string;
  language: {
    name: string;
  };
};

export default function ListDetailsPage({ params }: { params: { id: string } }) {
  const [list, setList] = useState<ListDetails | null>(null);
  const [words, setWords] = useState<WordOption[]>([]);

  const loadList = async () => {
    const response = await fetch(`/api/lists/${params.id}`);
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setList(data.list);
  };

  const loadWords = async () => {
    const response = await fetch("/api/words");
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setWords(data.words);
  };

  useEffect(() => {
    loadList();
    loadWords();
  }, [params.id]);

  const existingWordIds = useMemo(() => list?.listWords.map((item) => item.word.id) ?? [], [list?.listWords]);

  const addWord = async (wordId: string) => {
    await fetch(`/api/lists/${params.id}/words`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId })
    });
    await loadList();
  };

  const removeWord = async (wordId: string) => {
    await fetch(`/api/lists/${params.id}/words/${wordId}`, {
      method: "DELETE"
    });
    await loadList();
  };

  if (!list) {
    return <section>Loading list...</section>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{list.name}</h1>
        <AddWordToListModal words={words} existingWordIds={existingWordIds} onAdd={addWord} />
      </div>

      <div className="grid gap-3">
        {list.listWords.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <p className="font-semibold">{item.word.text}</p>
              <p className="text-sm text-slate-600">
                {item.word.language.name} · Translation: {item.word.translationsFrom[0]?.translatedWord.text ?? "-"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeWord(item.word.id)}
              className="rounded border border-rose-300 px-3 py-2 text-sm text-rose-700"
            >
              Remove
            </button>
          </div>
        ))}
        {list.listWords.length === 0 && <p className="text-sm text-slate-600">No words in this list yet.</p>}
      </div>
    </section>
  );
}
