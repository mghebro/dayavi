"use client";

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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTranslation } from "@/lib/i18n/context";

export function LandingClientView() {
  const { t, locale } = useTranslation();

  const isKa = locale === "ka";

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0F0F12] text-[#18181B] dark:text-[#F4F4F5] selection:bg-[#FF6B4A] selection:text-white flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 dark:bg-[#0F0F12]/90 backdrop-blur-md border-b-2 border-[#18181B] dark:border-[#3F3F4A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group select-none">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B4A] border-2 border-[#18181B] dark:border-[#3F3F4A] shadow-retro flex items-center justify-center text-white font-black text-2xl group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] transition-all">
              დ
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tight text-[#18181B] dark:text-[#F4F4F5]">
                {t.brand.name}<span className="text-[#FF6B4A]">.</span>
              </span>
              <span className="text-[10px] font-bold text-[#71717A] dark:text-[#A1A1AA] tracking-wider uppercase">
                დაყავი • Divide & Conquer
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-[#52525B] dark:text-[#A1A1AA]">
            <a href="#philosophy" className="hover:text-[#FF6B4A] transition-colors">
              {isKa ? "ფილოსოფია" : "Philosophy"}
            </a>
            <a href="#views" className="hover:text-[#FF6B4A] transition-colors">
              {isKa ? "5 ძირითადი ხედვა" : "5 Core Views"}
            </a>
            <a href="#architecture" className="hover:text-[#FF6B4A] transition-colors">
              {isKa ? "არქიტექტურა" : "Architecture"}
            </a>
            <a href="https://github.com/mghebro/dayavi" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6B4A] transition-colors">
              GitHub
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <LanguageSwitcher variant="pill" />
            <ThemeToggle variant="icon" />

            <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
              <Link href="/login">{isKa ? "შესვლა" : "Sign In"}</Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href="/register">
                <span>{isKa ? "დაწყება" : "Get Started"}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-8 border-b-2 border-[#18181B] dark:border-[#3F3F4A] bg-[#FDFBF7] dark:bg-[#0F0F12]">
        {/* Playful Background Elements */}
        <div className="absolute top-8 right-12 hidden lg:block rotate-6">
          <div className="p-3 bg-[#FEF08A] dark:bg-[#3D3512] text-[#18181B] dark:text-[#FDE047] border-2 border-[#18181B] dark:border-[#FACC15] rounded-xl shadow-retro-md text-xs font-black">
            ✦ Dark & Light Neo-Brutalist UX
          </div>
        </div>
        <div className="absolute bottom-10 left-8 hidden lg:block -rotate-3">
          <div className="p-3 bg-[#E0D8FF] dark:bg-[#2D2350] text-[#18181B] dark:text-[#C4B5FD] border-2 border-[#18181B] dark:border-[#A78BFA] rounded-xl shadow-retro-md text-xs font-black">
            ⚡ Next.js 16 + Neon + Prisma
          </div>
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0D8FF] dark:bg-[#2D2350] border-2 border-[#18181B] dark:border-[#A78BFA] shadow-retro-sm text-xs font-extrabold text-[#18181B] dark:text-[#C4B5FD]">
            <Sparkles className="w-4 h-4 text-[#FF6B4A]" />
            <span>PORTFOLIO-GRADE TASK PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#18181B] dark:text-[#F4F4F5] leading-[1.08]">
            {isKa ? (
              <>
                დიდი საქმეები კეთდება მაშინ, როდესაც მათ{" "}
                <span className="bg-[#FEF08A] dark:bg-[#3D3512] text-[#18181B] dark:text-[#FDE047] px-2 py-0.5 border-2 border-[#18181B] dark:border-[#FACC15] shadow-retro inline-block transform -rotate-1">
                  დაყოფ
                </span>
                .
              </>
            ) : (
              <>
                Great things happen when you{" "}
                <span className="bg-[#FEF08A] dark:bg-[#3D3512] text-[#18181B] dark:text-[#FDE047] px-2 py-0.5 border-2 border-[#18181B] dark:border-[#FACC15] shadow-retro inline-block transform -rotate-1">
                  break them down
                </span>
                .
              </>
            )}
          </h1>

          <p className="text-lg sm:text-xl text-[#52525B] dark:text-[#A1A1AA] max-w-2xl mx-auto font-medium leading-relaxed">
            {isKa ? (
              <>
                სახელწოდება მომდინარეობს ქართული სიტყვიდან <strong>დაყავი</strong> (<em>Divide and Conquer</em>). 
                მაღალი სიმჭიდროვის პროექტების სამართავი სივრცე, სადაც რედაქციული დიზაინი შერწყმულია Next.js 16-ის მკაცრ საინჟინრო სტანდარტებთან.
              </>
            ) : (
              <>
                Named after the Georgian word <strong>დაყავი</strong> (<em>dayavi</em> — &quot;divide&quot;). 
                A joyful, high-density project workspace pairing editorial craft with strict full-stack engineering.
              </>
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild variant="primary" size="lg" className="w-full sm:w-auto text-base h-13 px-8 font-black">
              <Link href="/register">
                <span>{isKa ? "სამუშაო სივრცის შექმნა" : "Launch Your Workspace"}</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto text-base h-13 px-8 font-black">
              <Link href="/login">
                {isKa ? "დემო ანგარიშებით შესვლა" : "Explore Demo Accounts"}
              </Link>
            </Button>
          </div>

          {/* Feature Highlights Pills */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181D] border border-[#18181B] dark:border-[#3F3F4A] shadow-retro-sm">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] dark:text-[#34D399]" />
              <span>Kanban Drag & Drop</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181D] border border-[#18181B] dark:border-[#3F3F4A] shadow-retro-sm">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] dark:text-[#34D399]" />
              <span>Multi-Select List View</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181D] border border-[#18181B] dark:border-[#3F3F4A] shadow-retro-sm">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] dark:text-[#34D399]" />
              <span>Calendar Schedule</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181D] border border-[#18181B] dark:border-[#3F3F4A] shadow-retro-sm">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] dark:text-[#34D399]" />
              <span>Live Time Tracking</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181D] border border-[#18181B] dark:border-[#3F3F4A] shadow-retro-sm">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] dark:text-[#34D399]" />
              <span>Command Palette (Cmd+K)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Architecture & Philosophy Section */}
      <section id="philosophy" className="py-20 px-4 sm:px-8 border-b-2 border-[#18181B] dark:border-[#3F3F4A] bg-[#F5F2EB] dark:bg-[#15151A]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <div className="inline-block px-3 py-1 rounded-md bg-[#FEF08A] dark:bg-[#3D3512] text-[#18181B] dark:text-[#FDE047] border border-[#18181B] dark:border-[#FACC15] text-xs font-black uppercase tracking-wider">
              {isKa ? "ძირითადი ფილოსოფია" : "CORE PHILOSOPHY"}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#18181B] dark:text-[#F4F4F5]">
              {isKa ? "5-დონიანი ორგანიზაციული იერარქია" : "The 5-Tier Organizational Hierarchy"}
            </h2>
            <p className="text-sm sm:text-base text-[#71717A] dark:text-[#A1A1AA] max-w-xl mx-auto">
              {isKa
                ? "ყოველი დიდი ინიციატივა ბუნებრივად ნაწილდება ორგანიზაციიდან ატომურ ტასკამდე."
                : "Every initiative naturally ladders up to the organization while remaining atomic at the execution layer."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { title: isKa ? "1. სამუშაო სივრცე" : "1. Workspace", desc: isKa ? "ორგანიზაციის საზღვარი, გუნდის წევრები, როლები და პარამეტრები." : "Tenant boundary, team members, labels, billing, and settings.", color: "bg-[#E0D8FF] dark:bg-[#2D2350] text-[#18181B] dark:text-[#C4B5FD]" },
              { title: isKa ? "2. პროექტი" : "2. Project", desc: isKa ? "მიზნობრივი ინიციატივები სტატუსებითა და მონაწილეებით." : "Targeted milestones with custom statuses and members.", color: "bg-[#FF6B4A] text-white" },
              { title: isKa ? "3. დაფა" : "3. Board", desc: isKa ? "სამუშაო პროცესის კონტეინერი სვეტების სამართავად." : "Configurable workflow pipeline organizing columns.", color: "bg-[#FEF08A] dark:bg-[#3D3512] text-[#18181B] dark:text-[#FDE047]" },
              { title: isKa ? "4. სვეტი" : "4. Column", desc: isKa ? "სტადიები WIP ლიმიტებითა და float ინდექსაციით." : "Workflow states with WIP limits and floating-point order index.", color: "bg-[#D1FAE5] dark:bg-[#143528] text-[#18181B] dark:text-[#6EE7B7]" },
              { title: isKa ? "5. ტასკი" : "5. Task", desc: isKa ? "ატომური ერთეული საბთასკებით, კომენტარებითა და ტაიმერით." : "Atomic work with subtasks, comments, dependencies, and time tracking.", color: "bg-white dark:bg-[#18181D] text-[#18181B] dark:text-[#F4F4F5]" },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-xl border-2 border-[#18181B] dark:border-[#3F3F4A] shadow-retro flex flex-col justify-between ${step.color}`}
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
      <section id="views" className="py-20 px-4 sm:px-8 border-b-2 border-[#18181B] dark:border-[#3F3F4A] bg-[#FDFBF7] dark:bg-[#0F0F12]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <div className="inline-block px-3 py-1 rounded-md bg-[#D1FAE5] dark:bg-[#143528] text-[#18181B] dark:text-[#6EE7B7] border border-[#18181B] dark:border-[#34D399] text-xs font-black uppercase tracking-wider">
              {isKa ? "ერთიანი ხედვები" : "UNIFIED LENSES"}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#18181B] dark:text-[#F4F4F5]">
              {isKa ? "ერთი მონაცემთა ბაზა. ხუთი სპეციალიზებული ხედვა." : "One source of truth. Five specialized views."}
            </h2>
            <p className="text-sm sm:text-base text-[#71717A] dark:text-[#A1A1AA] max-w-xl mx-auto">
              {isKa
                ? "სხვადასხვა ამოცანა მოითხოვს განსხვავებულ პერსპექტივას. მარტივად გადაერთე ხედვებს შორის მონაცემების დაკარგვის გარეშე."
                : "Different tasks require different perspectives. Seamlessly toggle between workflow lenses without fragmented data."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#18181D] shadow-retro space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B4A] border-2 border-[#18181B] dark:border-[#3F3F4A] flex items-center justify-center text-white">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#18181B] dark:text-[#F4F4F5]">1. Kanban Board</h3>
              <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
                {isKa ? "Drag & drop ინტერფეისი dnd-kit-ით, WIP ლიმიტები და მყისიერი inline შექმნა." : "Fluid drag-and-drop powered by @dnd-kit, WIP limits, and rapid inline task creation."}
              </p>
            </div>

            <div className="p-6 rounded-2xl border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#18181D] shadow-retro space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF08A] dark:bg-[#3D3512] text-[#18181B] dark:text-[#FDE047] border-2 border-[#18181B] dark:border-[#FACC15] flex items-center justify-center">
                <ListTodo className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#18181B] dark:text-[#F4F4F5]">2. Dense List View</h3>
              <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
                {isKa ? "ცხრილური ხედვა multi-select მონიშვნით, სორტირებითა და ჯგუფური მოქმედებებით." : "Power-user table with multi-select checkboxes, column sorting, and bulk priority/status mutations."}
              </p>
            </div>

            <div className="p-6 rounded-2xl border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#18181D] shadow-retro space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E0D8FF] dark:bg-[#2D2350] text-[#18181B] dark:text-[#C4B5FD] border-2 border-[#18181B] dark:border-[#A78BFA] flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#18181B] dark:text-[#F4F4F5]">3. Calendar Schedule</h3>
              <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
                {isKa ? "ვადების კალენდარული განრიგი და დაგეგმვა თვისა და კვირის ჭრილში." : "Monthly timeline tracking deadlines, startDate, and milestone completions."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#18181B] dark:bg-[#121216] text-white border-t-2 border-[#18181B] dark:border-[#3F3F4A] py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B4A] border border-white flex items-center justify-center font-black text-sm">
              დ
            </div>
            <div className="text-sm font-black">
              Dayavi (დაყავი) <span className="text-white/60 font-normal">© 2026</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-white/70 font-semibold">
            <Link href="/login" className="hover:text-white transition-colors">{isKa ? "შესვლა" : "Sign In"}</Link>
            <Link href="/register" className="hover:text-white transition-colors">{isKa ? "რეგისტრაცია" : "Register"}</Link>
            <a href="https://github.com/mghebro/dayavi" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
