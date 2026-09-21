import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Kanban,
  ListTodo,
  CalendarDays,
  BarChart3,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  Users,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] selection:bg-[#FF6B4A] selection:text-white flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b-2 border-[#18181B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group select-none">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B4A] border-2 border-[#18181B] shadow-retro flex items-center justify-center text-white font-black text-2xl group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] transition-all">
              დ
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tight text-[#18181B]">
                Dayavi<span className="text-[#FF6B4A]">.</span>
              </span>
              <span className="text-[10px] font-bold text-[#71717A] tracking-wider uppercase">
                დაყავი • Divide & Conquer
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-bold">
            <a href="#philosophy" className="hover:text-[#FF6B4A] transition-colors">Philosophy</a>
            <a href="#views" className="hover:text-[#FF6B4A] transition-colors">5 Core Views</a>
            <a href="#architecture" className="hover:text-[#FF6B4A] transition-colors">Architecture</a>
            <a href="https://github.com/mghebro/dayavi" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6B4A] transition-colors">GitHub</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href="/register">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-8 border-b-2 border-[#18181B] bg-[#FDFBF7]">
        {/* Playful Background Elements */}
        <div className="absolute top-8 right-12 hidden lg:block rotate-6">
          <div className="p-3 bg-[#FEF08A] border-2 border-[#18181B] rounded-xl shadow-retro-md text-xs font-black">
            ✦ Soft Neo-Brutalist UX
          </div>
        </div>
        <div className="absolute bottom-10 left-8 hidden lg:block -rotate-3">
          <div className="p-3 bg-[#E0D8FF] border-2 border-[#18181B] rounded-xl shadow-retro-md text-xs font-black">
            ⚡ Next.js 16 + Neon + Prisma
          </div>
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0D8FF] border-2 border-[#18181B] shadow-retro-sm text-xs font-extrabold text-[#18181B]">
            <Sparkles className="w-4 h-4 text-[#FF6B4A]" />
            <span>PORTFOLIO-GRADE TASK PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#18181B] leading-[1.08]">
            Great things happen when you <span className="bg-[#FEF08A] px-2 py-0.5 border-2 border-[#18181B] shadow-retro inline-block transform -rotate-1">break them down</span>.
          </h1>

          <p className="text-lg sm:text-xl text-[#52525B] max-w-2xl mx-auto font-medium leading-relaxed">
            Named after the Georgian word <strong>დაყავი</strong> (<em>dayavi</em> — &quot;divide&quot;). 
            A joyful, high-density project workspace pairing editorial craft with strict full-stack engineering.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild variant="primary" size="lg" className="w-full sm:w-auto text-base h-13 px-8 font-black">
              <Link href="/register">
                <span>Launch Your Workspace</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto text-base h-13 px-8 font-black">
              <Link href="/login">Explore Demo Accounts</Link>
            </Button>
          </div>

          {/* Feature Highlights Pills */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-[#18181B]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#18181B] shadow-retro-sm">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Kanban Drag & Drop</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#18181B] shadow-retro-sm">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Multi-Select List View</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#18181B] shadow-retro-sm">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Calendar Schedule</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#18181B] shadow-retro-sm">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Live Time Tracking</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#18181B] shadow-retro-sm">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Command Palette (Cmd+K)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Architecture & Philosophy Section */}
      <section id="philosophy" className="py-20 px-4 sm:px-8 border-b-2 border-[#18181B] bg-[#F5F2EB]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <div className="inline-block px-3 py-1 rounded-md bg-[#FEF08A] border border-[#18181B] text-xs font-black uppercase tracking-wider">
              CORE PHILOSOPHY
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#18181B]">
              The 5-Tier Organizational Hierarchy
            </h2>
            <p className="text-sm sm:text-base text-[#71717A] max-w-xl mx-auto">
              Every initiative naturally ladders up to the organization while remaining atomic at the execution layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { title: "1. Workspace", desc: "Tenant boundary, team members, labels, billing, and settings.", color: "bg-[#E0D8FF]" },
              { title: "2. Project", desc: "Targeted milestones with custom statuses and members.", color: "bg-[#FF6B4A] text-white" },
              { title: "3. Board", desc: "Configurable workflow pipeline organizing columns.", color: "bg-[#FEF08A]" },
              { title: "4. Column", desc: "Workflow states with WIP limits and floating-point order index.", color: "bg-[#D1FAE5]" },
              { title: "5. Task", desc: "Atomic work with subtasks, comments, dependencies, and time tracking.", color: "bg-white" },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-xl border-2 border-[#18181B] shadow-retro flex flex-col justify-between ${step.color}`}
              >
                <div>
                  <div className="text-xs font-black opacity-70 mb-1">LEVEL 0{idx + 1}</div>
                  <h3 className="text-base font-black mb-2">{step.title}</h3>
                  <p className="text-xs opacity-90 leading-relaxed font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Core Lenses (Views) Section */}
      <section id="views" className="py-20 px-4 sm:px-8 border-b-2 border-[#18181B] bg-[#FDFBF7]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <div className="inline-block px-3 py-1 rounded-md bg-[#D1FAE5] border border-[#18181B] text-xs font-black uppercase tracking-wider">
              UNIFIED LENSES
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#18181B]">
              One source of truth. Five specialized views.
            </h2>
            <p className="text-sm sm:text-base text-[#71717A] max-w-xl mx-auto">
              Different tasks require different perspectives. Seamlessly toggle between workflow lenses without fragmented data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border-2 border-[#18181B] bg-white shadow-retro-md space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FF6B4A] border-2 border-[#18181B] shadow-retro-sm flex items-center justify-center text-white">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#18181B]">Kanban Board</h3>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Accessible drag-and-drop powered by <code>@dnd-kit</code>. WIP limit warnings, column reordering, and instantaneous optimistic transitions.
              </p>
            </div>

            <div className="p-6 rounded-2xl border-2 border-[#18181B] bg-white shadow-retro-md space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FEF08A] border-2 border-[#18181B] shadow-retro-sm flex items-center justify-center text-[#18181B]">
                <ListTodo className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#18181B]">Dense List View</h3>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Power-user table with sortable columns, multi-row selection, inline editing, and bulk actions (batch status, priority, delete).
              </p>
            </div>

            <div className="p-6 rounded-2xl border-2 border-[#18181B] bg-white shadow-retro-md space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#E0D8FF] border-2 border-[#18181B] shadow-retro-sm flex items-center justify-center text-[#18181B]">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#18181B]">Calendar Schedule</h3>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Chronological timeline mapping start dates and due dates. Overdue highlights and milestone tracking in monthly and weekly views.
              </p>
            </div>

            <div className="p-6 rounded-2xl border-2 border-[#18181B] bg-white shadow-retro-md space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#D1FAE5] border-2 border-[#18181B] shadow-retro-sm flex items-center justify-center text-[#18181B]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#18181B]">Analytics & Metrics</h3>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Pure SQL-backed performance indicators: completion rates, workload distribution, bottleneck stage detection, and total hours logged.
              </p>
            </div>

            <div className="p-6 rounded-2xl border-2 border-[#18181B] bg-white shadow-retro-md space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#F5F2EB] border-2 border-[#18181B] shadow-retro-sm flex items-center justify-center text-[#18181B]">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#18181B]">My Tasks Triage</h3>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Personal daily planner categorizing your assigned tasks across all projects into Today, Overdue, Upcoming, and Completed.
              </p>
            </div>

            <div className="p-6 rounded-2xl border-2 border-[#18181B] bg-[#FDFBF7] border-dashed shadow-none space-y-3 flex flex-col justify-center">
              <h3 className="text-base font-black text-[#18181B]">Task Detail Drawer</h3>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Deep-linked modal/drawer (<code>?taskId=...</code>) with markdown descriptions, checklist subtasks, live stopwatch, DAG cycle prevention, and immutable activity logs.
              </p>
              <Link href="/login" className="text-xs font-extrabold text-[#FF6B4A] hover:underline flex items-center gap-1">
                Try it out in demo <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Full Stack Architecture Callout */}
      <section id="architecture" className="py-20 px-4 sm:px-8 border-b-2 border-[#18181B] bg-[#18181B] text-white">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          <div className="inline-block px-3 py-1 rounded-md bg-[#FF6B4A] border border-white text-xs font-black uppercase tracking-wider text-white">
            PRODUCTION STANDARDS
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Engineered for Real-World Quality
          </h2>
          <p className="text-sm sm:text-base text-[#A1A1AA] max-w-2xl mx-auto font-medium">
            Zero shortcuts. Built with full server-side authorization guards, transactional ACID database mutations, and strict WCAG 2.2 AA accessibility standards.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left pt-4">
            <div className="p-4 rounded-xl border border-[#3F3F46] bg-[#27272A]">
              <div className="text-xl font-black text-[#FF6B4A]">Next.js 16</div>
              <div className="text-xs text-[#A1A1AA] mt-1">App Router, RSC, Server Actions</div>
            </div>
            <div className="p-4 rounded-xl border border-[#3F3F46] bg-[#27272A]">
              <div className="text-xl font-black text-[#FEF08A]">Neon Postgres</div>
              <div className="text-xs text-[#A1A1AA] mt-1">Serverless pooler & migrations</div>
            </div>
            <div className="p-4 rounded-xl border border-[#3F3F46] bg-[#27272A]">
              <div className="text-xl font-black text-[#E0D8FF]">Prisma ORM</div>
              <div className="text-xs text-[#A1A1AA] mt-1">28 Models, typed queries, indexes</div>
            </div>
            <div className="p-4 rounded-xl border border-[#3F3F46] bg-[#27272A]">
              <div className="text-xl font-black text-[#D1FAE5]">Auth.js v5</div>
              <div className="text-xs text-[#A1A1AA] mt-1">Credentials, Google, GitHub</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-8 bg-[#FEF08A] text-[#18181B] text-center border-b-2 border-[#18181B]">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to divide and conquer?
          </h2>
          <p className="text-sm sm:text-base font-semibold max-w-xl mx-auto text-[#3F3F46]">
            Start managing projects with clarity, speed, and tactile delight. Explore with our pre-loaded demo accounts or create your own workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button asChild variant="primary" size="lg" className="w-full sm:w-auto h-13 px-8 text-base font-black">
              <Link href="/register">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-13 px-8 text-base font-black">
              <Link href="/login">Explore Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FDFBF7] py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#71717A]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#FF6B4A] border border-[#18181B] flex items-center justify-center text-white font-black text-xs">
              დ
            </div>
            <span>Dayavi (დაყავი) • Created by Giorgi Mgebrishvili</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/mghebro/dayavi" target="_blank" rel="noopener noreferrer" className="hover:text-[#18181B]">
              GitHub Repository
            </a>
            <Link href="/login" className="hover:text-[#18181B]">Sign In</Link>
            <Link href="/register" className="hover:text-[#18181B]">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
