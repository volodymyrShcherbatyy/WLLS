"use client";

import { useState } from "react";

interface MultipleChoiceTestProps {
  prompt: string;
  options: string[];
  correctAnswer: string;
  onSubmit: (isCorrect: boolean) => void;
}

export function MultipleChoiceTest({ prompt, options, correctAnswer, onSubmit }: MultipleChoiceTestProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-lg font-semibold">Translate: {prompt}</h3>
      <div className="grid gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSelected(option)}
            className={`rounded border px-3 py-2 text-left ${selected === option ? "border-brand bg-blue-50" : "border-slate-200"}`}
          >
            {option}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onSubmit(selected === correctAnswer)}
        disabled={!selected}
        className="rounded bg-brand px-4 py-2 text-white disabled:opacity-50"
      >
        Submit
      </button>
    </div>
  );
}
