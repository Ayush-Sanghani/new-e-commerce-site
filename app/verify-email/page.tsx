"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token")?.trim() ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid or missing verification link.");
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const result = await res.json();

        if (cancelled) return;

        if (res.ok) {
          setStatus("success");
          router.refresh();
          return;
        }

        setStatus("error");
        setErrorMessage(
          result.error || "Invalid or expired verification link. Please request a new one."
        );
      } catch {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage("Network error. Please check your connection.");
        }
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-10 text-center">
        <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-900 font-bold text-xl">DummyMart</span>
        </div>

        {status === "loading" && (
          <div className="py-6">
            <Loader2 className="w-10 h-10 animate-spin text-violet-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900">Verifying your email…</h1>
            <p className="text-slate-500 text-sm mt-2">Please wait a moment.</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-4">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Email verified!</h1>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Your account is ready. You&apos;re signed in and can start shopping.
            </p>
            <Link
              href="/home"
              className={cn(
                "mt-8 flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold",
                "bg-blue-600 text-white transition-all duration-150",
                "hover:bg-blue-700 active:scale-[0.98]",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              )}
            >
              Continue to Home
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="py-4">
            <div className="w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Verification failed</h1>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">{errorMessage}</p>
            <Link
              href="/register"
              className={cn(
                "mt-8 flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold",
                "bg-blue-600 text-white transition-all duration-150",
                "hover:bg-blue-700 active:scale-[0.98]"
              )}
            >
              Back to Register
            </Link>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
