"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Loader2, Sparkles, ArrowLeft, ShieldCheck, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

function getPasswordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return 1;
  if (score === 2) return 2;
  return 3;
}

const strengthMeta = {
  0: { label: "",       bars: 0, barColor: "bg-slate-200",   textColor: "text-slate-400" },
  1: { label: "Weak",   bars: 1, barColor: "bg-red-500",     textColor: "text-red-600"   },
  2: { label: "Fair",   bars: 2, barColor: "bg-amber-500",   textColor: "text-amber-600" },
  3: { label: "Strong", bars: 3, barColor: "bg-emerald-500", textColor: "text-emerald-600" },
};

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const { label, bars, barColor, textColor } = strengthMeta[strength];
  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {([1, 2, 3] as const).map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i <= bars ? barColor : "bg-slate-200"
            )}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className={cn("text-xs font-semibold", textColor)}>{label}</p>
      )}
    </div>
  );
}

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({ resolver: zodResolver(resetSchema) });

  const onSubmit = async (data: ResetFormData) => {
    if (!token) {
      setServerError("Invalid or missing reset link. Please request a new one.");
      return;
    }

    setIsLoading(true);
    setServerError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const result = await res.json();
      if (res.ok) {
        setIsSuccess(true);
      } else {
        setServerError(result.error || "Unable to reset password. Please try again.");
      }
    } catch {
      setServerError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Invalid token state ── */
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-10 text-center">
          <p className="text-slate-700 text-sm mb-6">
            Invalid or missing reset link. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] relative overflow-hidden flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-800 to-purple-900" />

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
              <p className="text-violet-300 text-base font-semibold mb-4">
                Almost there!
              </p>
              <h2 className="text-4xl font-bold text-white leading-tight">
                Set your new
                <br />
                password and get
                <br />
                back to shopping
              </h2>
              <p className="text-violet-200/80 text-base mt-4 leading-relaxed">
                Choose a strong password to keep your DummyMart account secure.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                "Use at least 8 characters",
                "Mix letters, numbers & symbols",
                "Don't reuse your old password",
              ].map((tip) => (
                <div key={tip} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-300 shrink-0" />
                  <span className="text-violet-200 text-sm">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-violet-400/60 text-xs">© 2026 DummyMart. All rights reserved.</p>
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
            {isSuccess ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Password updated!</h1>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed max-w-xs">
                  Your password has been reset successfully. You can now sign in with your new password.
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
                  Go to Sign In
                </Link>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
                  <p className="text-slate-500 text-sm mt-1">Choose a new password for your account</p>
                </div>

                {serverError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-red-700 text-sm">{serverError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* new password */}
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700">
                      New password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Min. 8 characters"
                        {...register("password", {
                          onChange: (e) => setPasswordValue(e.target.value),
                        })}
                        className={cn(
                          "w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm text-slate-900",
                          "bg-slate-50 placeholder-slate-400 transition-all duration-150",
                          "focus:outline-none focus:ring-2 focus:bg-white",
                          errors.password
                            ? "border-red-400 focus:ring-red-300"
                            : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <PasswordStrengthBar password={passwordValue} />
                    {errors.password && (
                      <p className="text-xs text-red-600">⚠ {errors.password.message}</p>
                    )}
                  </div>

                  {/* confirm password */}
                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                        className={cn(
                          "w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm text-slate-900",
                          "bg-slate-50 placeholder-slate-400 transition-all duration-150",
                          "focus:outline-none focus:ring-2 focus:bg-white",
                          errors.confirmPassword
                            ? "border-red-400 focus:ring-red-300"
                            : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-600">⚠ {errors.confirmPassword.message}</p>
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
                        Updating…
                      </span>
                    ) : (
                      "Update password"
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
