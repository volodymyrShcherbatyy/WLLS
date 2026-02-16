"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface WordItem {
  id: string;
  text: string;
  difficulty: number;
  imageUrl: string | null;
  language: { name: string };
}

interface Language {
  id: string;
  name: string;
}

export default function AdminPage() {
  const { data } = useSession();
  const [words, setWords] = useState<WordItem[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [text, setText] = useState("");
  const [languageId, setLanguageId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [translationWordId, setTranslationWordId] = useState("");

  const loadWords = async () => {
    const res = await fetch("/api/words");
    const data = await res.json();
    setWords(data.words || []);
  };

  useEffect(() => {
    loadWords();
    fetch("/api/languages")
      .then((res) => res.json())
      .then((data) => setLanguages(data.languages || []));
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await fetch("/api/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, languageId, imageUrl, difficulty, translationWordId: translationWordId || undefined })
    });
    setText("");
    setImageUrl("");
    setDifficulty(1);
    setTranslationWordId("");
    await loadWords();
  };

  if (!data?.user.isAdmin) {
    return <p className="rounded border border-red-200 bg-red-50 p-4 text-red-700">Admin access required.</p>;
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Admin</h1>
      <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Word text" className="rounded border border-slate-300 px-3 py-2" required />
        <select value={languageId} onChange={(event) => setLanguageId(event.target.value)} className="rounded border border-slate-300 px-3 py-2" required>
          <option value="">Select language</option>
          {languages.map((language) => (
            <option key={language.id} value={language.id}>{language.name}</option>
          ))}
        </select>
        <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Image URL" className="rounded border border-slate-300 px-3 py-2" />
        <input type="number" min={1} max={5} value={difficulty} onChange={(event) => setDifficulty(Number(event.target.value))} className="rounded border border-slate-300 px-3 py-2" />
        <select value={translationWordId} onChange={(event) => setTranslationWordId(event.target.value)} className="rounded border border-slate-300 px-3 py-2">
          <option value="">Optional translation link</option>
          {words.map((word) => (
            <option key={word.id} value={word.id}>{word.text} ({word.language.name})</option>
          ))}
        </select>
        <button type="submit" className="rounded bg-brand px-4 py-2 text-white">Create word</button>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-xl font-semibold">All words</h2>
        <ul className="space-y-2 text-sm">
          {words.map((word) => (
            <li key={word.id} className="rounded border border-slate-200 p-2">
              {word.text} · {word.language.name} · difficulty {word.difficulty}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
