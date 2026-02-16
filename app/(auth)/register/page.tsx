"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

interface Language {
  id: string;
  code: string;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nativeLanguageId, setNativeLanguageId] = useState("");
  const [targetLanguageId, setTargetLanguageId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/languages")
      .then((res) => res.json())
      .then((data) => {
        setLanguages(data.languages || []);
      });
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, nativeLanguageId, targetLanguageId })
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Registration failed");
      return;
    }

    router.push("/login");
  };

  return (
    <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Register</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" className="w-full rounded border border-slate-300 px-3 py-2" required />
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="w-full rounded border border-slate-300 px-3 py-2" required />
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="w-full rounded border border-slate-300 px-3 py-2" required minLength={8} />
        <select value={nativeLanguageId} onChange={(event) => setNativeLanguageId(event.target.value)} className="w-full rounded border border-slate-300 px-3 py-2" required>
          <option value="">Select native language</option>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>{lang.name}</option>
          ))}
        </select>
        <select value={targetLanguageId} onChange={(event) => setTargetLanguageId(event.target.value)} className="w-full rounded border border-slate-300 px-3 py-2" required>
          <option value="">Select target language</option>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>{lang.name}</option>
          ))}
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-brand px-4 py-2 text-white" type="submit">Create account</button>
      </form>
      <p className="mt-4 text-sm text-slate-600">Already registered? <Link href="/login" className="text-brand">Login</Link></p>
    </section>
  );
}
