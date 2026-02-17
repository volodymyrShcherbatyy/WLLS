"use client";

import { useCallback, useEffect, useState } from "react";

import { InputTest } from "@/components/InputTest";
import { MultipleChoiceTest } from "@/components/MultipleChoiceTest";

type TestPayload = {
  type: "mcq" | "input";
  wordId: string;
  source: "global" | "user";
  prompt: string;
  answer: string;
  options?: string[];
};

async function parseResponseJson(response: Response) {
  const rawBody = await response.text();

  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default function TestPage() {
  const [mode, setMode] = useState<"mcq" | "input">("mcq");
  const [question, setQuestion] = useState<TestPayload | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const loadQuestion = useCallback(async () => {
    const response = await fetch(`/api/tests/generate?type=${mode}`);
    const data = await parseResponseJson(response);

    if (!response.ok || !data?.test) {
      setQuestion(null);
      setStatus(typeof data?.error === "string" ? data.error : "Unable to load test question.");
      return;
    }

    setQuestion(data.test as TestPayload);
    setStatus(null);
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
      body: JSON.stringify({ wordId: question.wordId, source: question.source, isCorrect })
    });

    const data = await parseResponseJson(response);

    if (!response.ok) {
      setStatus(typeof data?.error === "string" ? data.error : "Unable to submit test answer.");
      return;
    }

    const score = typeof data?.score === "number" ? data.score : Number(isCorrect);
    setStatus(`Answer ${isCorrect ? "correct" : "wrong"}. Score: ${score}`);

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
