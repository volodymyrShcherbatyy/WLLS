"use client";

import { FormEvent, useEffect, useState } from "react";

import { CustomListCard } from "@/components/CustomListCard";

type ListItem = {
  id: string;
  name: string;
  _count: {
    listWords: number;
  };
};

export default function ListsPage() {
  const [lists, setLists] = useState<ListItem[]>([]);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadLists = async () => {
    const response = await fetch("/api/lists");
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setLists(data.lists);
  };

  useEffect(() => {
    loadLists();
  }, []);

  const createList = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }

    setIsSaving(true);
    const response = await fetch("/api/lists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name })
    });

    if (response.ok) {
      setName("");
      await loadLists();
    }

    setIsSaving(false);
  };

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Custom lists</h1>
      <form onSubmit={createList} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 md:flex-row">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="List name"
          className="flex-1 rounded border border-slate-300 px-3 py-2"
        />
        <button type="submit" disabled={isSaving} className="rounded bg-brand px-4 py-2 text-white disabled:opacity-50">
          {isSaving ? "Creating..." : "Create list"}
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {lists.map((list) => (
          <CustomListCard key={list.id} id={list.id} name={list.name} wordCount={list._count.listWords} />
        ))}
      </div>
    </section>
  );
}
