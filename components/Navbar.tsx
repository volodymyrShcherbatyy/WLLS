"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function Navbar() {
  const { data } = useSession();

  if (!data?.user) {
    return null;
  }

  const nativeCode = data.user.nativeLanguageCode?.toUpperCase() ?? "--";
  const targetCode = data.user.targetLanguageCode?.toUpperCase() ?? "--";

  return (
    <nav className="mb-8 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/learn">Learn</Link>
          <Link href="/test">Test</Link>
          <Link href="/library">Library</Link>
          <Link href="/lists">Lists</Link>
          {data.user.isAdmin && <Link href="/admin">Admin</Link>}
        </div>
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
        <div className="flex items-center gap-3 text-sm text-slate-700">
          <span className="text-xs text-slate-500">
            {nativeCode} / {targetCode}
          </span>
          <span className="font-semibold">
            Hello, {data.user.name || "Learner"}
          </span>
        </div>
        <button
          type="button"
          className="self-start rounded bg-slate-900 px-3 py-1 text-sm text-white md:self-auto"
          onClick={() => signOut({ callbackUrl: "/" })}
        >Logout</button>
      </div>
    </nav>
  );
}
