"use client";

import { useMemo, useState } from "react";

type WordOption = {
  id: string;
  text: string;
  language: {
    name: string;
  };
};

interface AddWordToListModalProps {
  words: WordOption[];
  existingWordIds: string[];
  onAdd: (wordId: string) => Promise<void>;
}

export function AddWordToListModal({ words, existingWordIds, onAdd }: AddWordToListModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const availableWords = useMemo(
    () => words.filter((word) => !existingWordIds.includes(word.id)),
    [existingWordIds, words]
  );

  const handleAdd = async () => {
    if (!selectedWordId) {
      return;
    }

    setIsSaving(true);
    await onAdd(selectedWordId);
    setSelectedWordId("");
    setIsSaving(false);
    setOpen(false);
  };

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)} className="rounded bg-brand px-4 py-2 text-white">
        Add word
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
            <h3 className="text-lg font-semibold">Add word to list</h3>
            <select
              value={selectedWordId}
              onChange={(event) => setSelectedWordId(event.target.value)}
              className="mt-3 w-full rounded border border-slate-300 px-3 py-2"
            >
              <option value="">Select word</option>
              {availableWords.map((word) => (
                <option key={word.id} value={word.id}>
                  {word.text} ({word.language.name})
                </option>
              ))}
            </select>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded border border-slate-300 px-3 py-2">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!selectedWordId || isSaving}
                className="rounded bg-brand px-3 py-2 text-white disabled:opacity-50"
              >
                {isSaving ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
