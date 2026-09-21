"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { requestPasswordReset } from "@/server/actions/auth";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const res = await requestPasswordReset({ email });
      if (res.success) {
        setMessage(res.message || "Reset link dispatched.");
      } else {
        setError(res.error || "Failed to process request.");
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
        <div className="inline-block w-fit px-2.5 py-0.5 rounded-md bg-[#D1FAE5] border border-[#18181B] text-[11px] font-bold text-[#18181B] mb-1">
          ACCOUNT RECOVERY
        </div>
        <CardTitle className="text-2xl font-black tracking-tight text-[#18181B]">
          Reset Password
        </CardTitle>
        <CardDescription className="text-sm text-[#71717A]">
          Enter your registered email and we will send you a secure link to reset your credentials.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#FEE2E2] border border-[#EF4444] text-xs font-semibold text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#DCFCE7] border border-[#10B981] text-xs font-semibold text-[#166534]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#18181B]">Your Email</label>
            <Input
              type="email"
              placeholder="giorgi@dayavi.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full h-11 text-sm font-bold mt-2"
            disabled={isLoading}
          >
            {isLoading ? "Sending link..." : "Send Reset Link"}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-[#E4E4E7] pt-4 mt-2">
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-xs font-bold text-[#71717A] hover:text-[#18181B] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
