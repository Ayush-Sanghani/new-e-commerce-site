"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Loader2, Mail, Sparkles, ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-900 font-bold text-xl">DummyApp</span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-900">Forgot password</h1>
            <p className="text-slate-500 text-sm mt-1">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {successMessage && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-emerald-700 text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {serverError && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-red-700 text-sm">{serverError}</p>
            </div>
          )}

          {!successMessage && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                        : "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-200"
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600">⚠ {errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-150",
                  "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
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
          )}

          <Link
            href="/login"
            className="mt-6 flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
