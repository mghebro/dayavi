"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { resetPassword } from "@/server/actions/auth";
import { ArrowRight, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Missing or invalid reset token. Please request a new link.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await resetPassword({ token, password });
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(res.error || "Failed to reset password.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-white border-2 border-[#18181B] shadow-retro-md">
      <CardHeader className="space-y-1 text-left pb-4">
        <div className="inline-block w-fit px-2.5 py-0.5 rounded-md bg-[#FEF08A] border border-[#18181B] text-[11px] font-bold text-[#18181B] mb-1">
          CREDENTIAL UPDATE
        </div>
        <CardTitle className="text-2xl font-black tracking-tight text-[#18181B]">
          Set New Password
        </CardTitle>
        <CardDescription className="text-sm text-[#71717A]">
          Choose a strong password to secure your Dayavi workspace.
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
            <span>Password updated! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B]">New Password (Min. 8 chars)</label>
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

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B]">Confirm New Password</label>
            <Input
              type="password"
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isLoading ? "Saving password..." : "Update Password"}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-[#E4E4E7] pt-4 mt-2">
        <Link
          href="/login"
          className="text-xs font-bold text-[#71717A] hover:text-[#18181B] transition-colors"
        >
          Return to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-bold">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
