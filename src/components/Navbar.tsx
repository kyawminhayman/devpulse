"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-[#111827] border-b border-slate-800 p-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/blog" className="text-2xl font-bold text-indigo-500">
          DevPulse
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/blog" className="text-slate-300 hover:text-white transition-colors">
            Blogs
          </Link>
          {session ? (
            <>
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="bg-slate-700 hover:bg-slate-600 text-white py-1 px-3 rounded text-sm transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 rounded text-sm transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
