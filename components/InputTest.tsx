"use client";

import { FormEvent, useState } from "react";

interface InputTestProps {
  prompt: string;
  correctAnswer: string;
  onSubmit: (isCorrect: boolean) => void;
}

export function InputTest({ prompt, correctAnswer, onSubmit }: InputTestProps) {
  const [answer, setAnswer] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase());
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-lg font-semibold">Type translation for: {prompt}</h3>
      <input
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        className="w-full rounded border border-slate-300 px-3 py-2"
        placeholder="Your answer"
      />
      <button type="submit" className="rounded bg-brand px-4 py-2 text-white">
        Submit
      </button>
    </form>
  );
}
