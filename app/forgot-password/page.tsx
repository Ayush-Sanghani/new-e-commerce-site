"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Loader2, Mail, Sparkles, ArrowLeft, KeyRound, InboxIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    setServerError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        setSuccessMessage(
          result.message ||
            "If an account exists with that email, you will receive a password reset link shortly."
        );
      } else {
        setServerError(result.error || "Unable to send reset link. Please try again.");
      }
    } catch {
      setServerError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] relative overflow-hidden flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-800 to-indigo-900" />

        {/* decorative circles */}
        <div className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-white/[0.04]" />
        <div className="absolute -bottom-36 -left-20 w-80 h-80 rounded-full bg-white/[0.04]" />
        <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-white/[0.03] translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">DummyMart</span>
          </div>

          {/* center content */}
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-white/80" />
            </div>
            <div>
              <p className="text-blue-300 text-base font-semibold mb-4">
                Account recovery
              </p>
              <h2 className="text-4xl font-bold text-white leading-tight">
                Reset your password
                <br />
                and get back
                <br />
                to shopping
              </h2>
              <p className="text-blue-200/80 text-base mt-4 leading-relaxed">
                Enter your email and we'll send you a secure link to create a
                new password.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                "Secure, time-limited reset link",
                "No password stored in plain text",
                "Back shopping in under 2 minutes",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                  <span className="text-blue-200 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-blue-400/60 text-xs">© 2026 DummyMart. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50">
        <div className="w-full max-w-lg">
          {/* mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-900 font-bold text-xl">DummyMart</span>
          </div>

          {/* card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 p-10">
            {successMessage ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6">
                  <InboxIcon className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Check your inbox</h1>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed max-w-xs">
                  We've sent a password reset link to your email. The link expires in 15 minutes.
                </p>
                <Link
                  href="/login"
                  className={cn(
                    "mt-8 flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold",
                    "bg-blue-600 text-white transition-all duration-150",
                    "hover:bg-blue-700 active:scale-[0.98]",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  )}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-slate-900">Forgot password?</h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                {serverError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-red-700 text-sm">{serverError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        {...register("email")}
                        className={cn(
                          "w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900",
                          "bg-slate-50 placeholder-slate-400 transition-all duration-150",
                          "focus:outline-none focus:ring-2 focus:bg-white",
                          errors.email
                            ? "border-red-400 focus:ring-red-300"
                            : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                        )}
                      />
                    </div>
                    {errors.email ? (
                      <p className="text-xs text-red-600">⚠ {errors.email.message}</p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        We'll send a secure reset link to this email. The link expires in 15 minutes.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-150",
                      "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                      "shadow-md shadow-blue-500/20",
                      "disabled:opacity-60 disabled:cursor-not-allowed"
                    )}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending…
                      </span>
                    ) : (
                      "Send reset link"
                    )}
                  </button>
                </form>

                <Link
                  href="/login"
                  className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
