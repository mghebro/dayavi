"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { verifyEmailToken } from "@/server/actions/verify";
import { Mail, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"waiting" | "verifying" | "success" | "error">(
    token ? "verifying" : "waiting"
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    verifyEmailToken(token).then((res) => {
      if (!isMounted) return;
      if (res.success) {
        setStatus("success");
        setMessage(res.message || "Email verified successfully!");
      } else {
        setStatus("error");
        setMessage(res.error || "Verification failed or token expired.");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <Card className="w-full bg-white border-2 border-[#18181B] shadow-retro-md">
      <CardHeader className="space-y-1 text-left pb-4">
        <div className="inline-block w-fit px-2.5 py-0.5 rounded-md bg-[#E0D8FF] border border-[#18181B] text-[11px] font-bold text-[#18181B] mb-1">
          EMAIL VERIFICATION
        </div>
        <CardTitle className="text-2xl font-black tracking-tight text-[#18181B]">
          {status === "waiting" && "Check Your Inbox"}
          {status === "verifying" && "Verifying Token..."}
          {status === "success" && "Verification Complete"}
          {status === "error" && "Verification Issue"}
        </CardTitle>
        <CardDescription className="text-sm text-[#71717A]">
          {status === "waiting" &&
            `We dispatched a verification email${email ? ` to ${email}` : ""}. Please click the link to confirm your account.`}
          {status === "verifying" && "We are authenticating your confirmation link."}
          {status === "success" && "Your email has been verified. Your Dayavi workspace is ready."}
          {status === "error" && message}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 py-4">
        {status === "waiting" && (
          <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-[#FDFBF7] border-2 border-dashed border-[#18181B]/20 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FEF08A] border-2 border-[#18181B] shadow-retro-sm flex items-center justify-center mb-3">
              <Mail className="w-6 h-6 text-[#18181B]" />
            </div>
            <p className="text-xs text-[#71717A] max-w-xs">
              Did not receive the email? Check your spam folder or sign in with your credentials to re-trigger.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#DCFCE7] border-2 border-[#18181B] shadow-retro-sm">
            <CheckCircle2 className="w-6 h-6 text-[#10B981] shrink-0" />
            <div className="text-xs text-[#166534] font-semibold leading-relaxed">
              {message}
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FEE2E2] border-2 border-[#18181B] shadow-retro-sm">
            <AlertCircle className="w-6 h-6 text-[#DC2626] shrink-0" />
            <div className="text-xs text-[#DC2626] font-semibold leading-relaxed">
              {message}
            </div>
          </div>
        )}

        <Button asChild variant="primary" className="w-full h-11 text-sm font-bold">
          <Link href="/login">
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </Button>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-[#E4E4E7] pt-4">
        <Link href="/" className="text-xs font-bold text-[#71717A] hover:text-[#18181B] transition-colors">
          Return to Dayavi Home
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-bold">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
