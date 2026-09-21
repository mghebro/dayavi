"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { registerUser } from "@/server/actions/auth";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await registerUser({ name, email, password });
      if (!res.success) {
        setError(res.error || "Registration failed.");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      // Auto sign-in after successful registration
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!signInRes?.error) {
        router.push("/app");
        router.refresh();
      } else {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-white border-2 border-[#18181B] shadow-retro-md">
      <CardHeader className="space-y-1 text-left pb-4">
        <div className="inline-block w-fit px-2.5 py-0.5 rounded-md bg-[#FEF08A] border border-[#18181B] text-[11px] font-bold text-[#18181B] mb-1">
          NEW WORKSPACE
        </div>
        <CardTitle className="text-2xl font-black tracking-tight text-[#18181B]">
          Give your work a home.
        </CardTitle>
        <CardDescription className="text-sm text-[#71717A]">
          Create your account and initialize your first creative workspace in seconds.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#FEE2E2] border border-[#EF4444] text-xs font-semibold text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#DCFCE7] border border-[#10B981] text-xs font-semibold text-[#166534]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Account created! Redirecting to your workspace...</span>
          </div>
        )}

        <OAuthButtons />

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-[#E4E4E7] w-full" />
          <span className="bg-white px-3 text-[11px] font-bold tracking-wider text-[#A1A1AA] uppercase absolute">
            Or register with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B]">Full Name</label>
            <Input
              type="text"
              placeholder="Giorgi Mgebrishvili"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading || isSuccess}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B]">Work Email</label>
            <Input
              type="email"
              placeholder="giorgi@dayavi.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading || isSuccess}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B]">Password (Min. 8 characters)</label>
            <Input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={isLoading || isSuccess}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full h-11 text-sm font-bold mt-2"
            disabled={isLoading || isSuccess}
          >
            {isLoading ? "Setting up workspace..." : "Create Account & Workspace"}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-[#E4E4E7] pt-4 mt-2">
        <p className="text-xs text-[#71717A]">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#FF6B4A] hover:underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
