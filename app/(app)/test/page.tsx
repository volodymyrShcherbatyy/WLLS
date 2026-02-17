"use client";

import { useCallback, useEffect, useState } from "react";

import { InputTest } from "@/components/InputTest";
import { MultipleChoiceTest } from "@/components/MultipleChoiceTest";

type TestPayload = {
  type: "mcq" | "input";
  wordId: string;
  prompt: string;
  answer: string;
  options?: string[];
};

export default function TestPage() {
  const [mode, setMode] = useState<"mcq" | "input">("mcq");
  const [question, setQuestion] = useState<TestPayload | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const loadQuestion = useCallback(async () => {
    const response = await fetch(`/api/tests/generate?type=${mode}`);
    const data = await response.json();
    setQuestion(data.test);
  }, [mode]);

  useEffect(() => {
    void loadQuestion();
  }, [loadQuestion]);

  const handleSubmit = async (isCorrect: boolean) => {
    if (!question) {
      return;
    }

    const response = await fetch("/api/tests/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId: question.wordId, isCorrect })
    });

    const data = await response.json();
    setStatus(`Answer ${isCorrect ? "correct" : "wrong"}. Score: ${data.score}`);

    await new Promise((resolve) => {
      setTimeout(resolve, 650);
    });

    await loadQuestion();
  };

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Tests</h1>
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode("mcq")} className="rounded border px-3 py-2">Word → Translation</button>
        <button type="button" onClick={() => setMode("input")} className="rounded border px-3 py-2">Translation → Word</button>
      </div>
      {question && mode === "mcq" && question.options && (
        <MultipleChoiceTest
          prompt={question.prompt}
          options={question.options}
          correctAnswer={question.answer}
          onSubmit={handleSubmit}
        />
      )}
      {question && mode === "input" && (
        <InputTest prompt={question.prompt} correctAnswer={question.answer} onSubmit={handleSubmit} />
      )}
      {status && <p className="text-sm text-slate-700">{status}</p>}
    </section>
  );
}
