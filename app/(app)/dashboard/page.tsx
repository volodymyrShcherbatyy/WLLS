import Link from "next/link";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getAuthSession();
  const userId = session!.user.id;

  const [progressCount, masteredCount, latestResult] = await Promise.all([
    prisma.progress.count({ where: { userId } }),
    prisma.progress.count({ where: { userId, masteryLevel: { gte: 5 } } }),
    prisma.testResult.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } })
  ]);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">Tracked words: {progressCount}</div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">Mastered words: {masteredCount}</div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">Latest test score: {latestResult?.score ?? "No tests yet"}</div>
      </div>
      <div className="flex gap-3">
        <Link href="/learn" className="rounded bg-brand px-4 py-2 text-white">Go to Learn</Link>
        <Link href="/test" className="rounded border border-slate-300 px-4 py-2">Go to Test</Link>
      </div>
    </section>
  );
}
