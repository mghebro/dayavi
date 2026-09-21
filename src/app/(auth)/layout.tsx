import React from "react";
import Link from "next/link";
import { Sparkles, Layers, ArrowRight } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#FDFBF7] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 group cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FF6B4A] border-2 border-[#18181B] shadow-retro flex items-center justify-center text-white font-black text-xl group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] transition-all">
            დ
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-[#18181B]">
              Dayavi<span className="text-[#FF6B4A]">.</span>
            </span>
            <span className="text-[10px] font-semibold text-[#71717A] tracking-wider uppercase">
              დაყავი • Divide & Conquer
            </span>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FEF08A] border border-[#18181B] shadow-retro-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#18181B]" />
          <span>Playful Editorial Workspace</span>
        </div>
      </header>

      {/* Center Auth Card Container */}
      <main className="my-auto py-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A] border-t border-[#E4E4E7] pt-4">
        <div>© {new Date().getFullYear()} Dayavi. Portfolio-grade Task Management Platform.</div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-[#18181B] transition-colors">Login</Link>
          <Link href="/register" className="hover:text-[#18181B] transition-colors">Register</Link>
          <a href="https://github.com/mghebro/dayavi" target="_blank" rel="noopener noreferrer" className="hover:text-[#18181B] transition-colors">GitHub Repository</a>
        </div>
      </footer>
    </div>
  );
}
