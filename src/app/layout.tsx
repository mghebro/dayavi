import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Dayavi (დაყავი) — Playful Editorial Task Management",
  description:
    "A portfolio-grade, production-quality project management platform engineered with Next.js 16, PostgreSQL (Neon), Prisma ORM, and Auth.js v5.",
  keywords: ["task management", "project management", "kanban", "next.js", "prisma", "neon"],
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
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#FDFBF7] text-[#18181B] antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#18181B",
              border: "2px solid #18181B",
              borderRadius: "12px",
              boxShadow: "3px 3px 0px 0px #18181B",
              fontWeight: "600",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
