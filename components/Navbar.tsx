"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function Navbar() {
  const { data } = useSession();

  if (!data?.user) {
    return null;
  }

  return (
    <nav className="mb-8 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex gap-4 text-sm font-medium">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/learn">Learn</Link>
        <Link href="/test">Test</Link>
        <Link href="/library">Library</Link>
        <Link href="/lists">Lists</Link>
        {data.user.isAdmin && <Link href="/admin">Admin</Link>}
      </div>
      <button
        type="button"
        className="rounded bg-slate-900 px-3 py-1 text-sm text-white"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Logout
      </button>
    </nav>
  );
}
