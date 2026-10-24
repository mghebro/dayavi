import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n/context";

export const metadata: Metadata = {
  title: "Dayavi (დაყავი) — Playful Editorial Task Management",
  description:
    "A portfolio-grade, production-quality project management platform engineered with Next.js 16, PostgreSQL (Neon), Prisma ORM, and Auth.js v5.",
  keywords: ["task management", "project management", "kanban", "next.js", "prisma", "neon", "დაყავი"],
  authors: [{ name: "Giorgi Mgebrishvili" }],
  openGraph: {
    title: "Dayavi (დაყავი) — Task & Project Management",
    description: "Divide and conquer your complex initiatives with tactile editorial delight.",
    url: "https://dayavi.app",
    siteName: "Dayavi",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('dayavi_theme');
                  var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#FDFBF7] dark:bg-[#0F0F12] text-[#18181B] dark:text-[#F4F4F5] antialiased">
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: "border-2 border-[#18181B] dark:border-[#3F3F4A] bg-white dark:bg-[#18181D] text-[#18181B] dark:text-[#F4F4F5] shadow-retro-md font-semibold text-xs",
                style: {
                  borderRadius: "12px",
                },
              }}
            />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
