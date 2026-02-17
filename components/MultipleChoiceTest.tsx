"use client";

import { useState } from "react";

interface MultipleChoiceTestProps {
  prompt: string;
  options: string[];
  correctAnswer: string;
  onSubmit: (isCorrect: boolean) => void | Promise<void>;
}

export function MultipleChoiceTest({ prompt, options, correctAnswer, onSubmit }: MultipleChoiceTestProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const handleSelect = async (option: string) => {
    if (isLocked) {
      return;
    }

    setSelected(option);
    setIsLocked(true);
    await onSubmit(option === correctAnswer);
  };

  const getOptionClassName = (option: string) => {
    if (!selected) {
      return "border-slate-200 bg-white hover:border-slate-300";
    }

    if (option === correctAnswer) {
      return "border-green-600 bg-green-500 text-white hover:bg-green-500";
    }

    if (option === selected && option !== correctAnswer) {
      return "border-red-600 bg-red-500 text-white hover:bg-red-500";
    }

    return "border-slate-200 bg-slate-100 text-slate-500";
  };

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-lg font-semibold">Translate: {prompt}</h3>
      <div className="flex flex-col gap-2 sm:flex-row">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => void handleSelect(option)}
            disabled={isLocked}
            aria-pressed={selected === option}
            className={`flex-1 rounded border px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-95 ${getOptionClassName(option)}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
