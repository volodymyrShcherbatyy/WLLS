"use client";

import { useState } from "react";

interface AddWordPayload {
  text: string;
  translation: string;
  imageUrl?: string;
}

interface AddWordToListModalProps {
  onAdd: (payload: AddWordPayload) => Promise<void>;
}

export function AddWordToListModal({ onAdd }: AddWordToListModalProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isDisabled = !text.trim() || !translation.trim() || isSaving;

  const handleAdd = async () => {
    if (!text.trim() || !translation.trim()) {
      return;
    }

    setIsSaving(true);
    await onAdd({
      text: text.trim(),
      translation: translation.trim(),
      imageUrl: imageUrl.trim() || undefined
    });
    setText("");
    setTranslation("");
    setImageUrl("");
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
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="mt-3 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Word"
            />
            <input
              value={translation}
              onChange={(event) => setTranslation(event.target.value)}
              className="mt-3 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Translation"
            />
            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              className="mt-3 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Image URL (optional)"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded border border-slate-300 px-3 py-2">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={isDisabled}
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
