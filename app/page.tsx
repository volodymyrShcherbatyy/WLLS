import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <h1 className="text-4xl font-bold">Welcome to WLLS</h1>
      <p className="mt-4 text-slate-600">
        Learn vocabulary with images, test your memory in both directions, and track mastery progress.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/register" className="rounded bg-brand px-5 py-2 text-white">
          Get Started
        </Link>
        <Link href="/login" className="rounded border border-slate-300 px-5 py-2">
          Login
        </Link>
      </div>
    </section>
  );
}
