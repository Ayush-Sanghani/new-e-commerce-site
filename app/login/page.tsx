"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  Sparkles,
  CheckCircle2,
  ShoppingCart,
  Heart,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getGoogleLoginErrorMessage } from "@/lib/google-login-errors";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const features = [
  { icon: ShoppingCart, label: "Access your orders anytime" },
  { icon: Heart,        label: "Save your wishlist" },
  { icon: ShieldCheck,  label: "Secure & private checkout" },
];

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const resetSuccess = searchParams.get("reset") === "success";
  const googleError = getGoogleLoginErrorMessage(searchParams.get("error"));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);
    setResendMessage(null);
    setNeedsVerification(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        router.push("/home");
        router.refresh();
      } else {
        if (result.code === "email_not_verified") {
          setNeedsVerification(true);
          setVerificationEmail(data.email);
        }
        setServerError(result.error || result.message || "Login failed. Please try again.");
      }
    } catch {
      setServerError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const onResendVerification = async () => {
    if (!verificationEmail) return;

    setIsResending(true);
    setResendMessage(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail }),
      });
      const result = await res.json();
      if (res.ok) {
        setResendMessage(result.message || "Verification email sent.");
      } else {
        setServerError(result.error || "Unable to resend email. Try again.");
      }
    } catch {
      setServerError("Network error. Please check your connection.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] relative overflow-hidden flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-900" />

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
            <span className="text-white font-bold text-xl tracking-tight">
              VrajPharma
            </span>
          </div>

          {/* center content */}
          <div className="space-y-8">
            <div>
              <p className="text-indigo-300 text-base font-semibold mb-4">
                Welcome back
              </p>
              <h2 className="text-4xl font-bold text-white leading-tight">
                Sign in to
                <br />
                VrajPharma
              </h2>
              <p className="text-indigo-200/80 text-base mt-4 leading-relaxed">
                Shop smarter — track orders, save favourites, and checkout
                securely from one place.
              </p>
            </div>

            <div className="space-y-4">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-indigo-300" />
                  </div>
                  <span className="text-indigo-200 text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-indigo-400/60 text-xs">
            © 2026 VrajPharma. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          {/* mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-900 font-bold text-xl">VrajPharma</span>
          </div>

          {/* card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
              <p className="text-slate-500 text-sm mt-1">
                Enter your credentials to continue
              </p>
            </div>

            {/* success banner */}
            {registered && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-700 text-sm font-medium">
                  Account created! Check your email to verify before signing in.
                </p>
              </div>
            )}

            {resetSuccess && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-700 text-sm font-medium">
                  Password updated. Please sign in.
                </p>
              </div>
            )}

            {/* error banner */}
            {(serverError || googleError) && (
              <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div className="text-left">
                  <p className="text-red-700 text-sm">{serverError ?? googleError}</p>
                  {needsVerification && (
                    <button
                      type="button"
                      onClick={onResendVerification}
                      disabled={isResending}
                      className="mt-3 text-sm font-semibold text-red-800 underline underline-offset-2 disabled:opacity-60"
                    >
                      {isResending ? "Sending…" : "Resend verification email"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {resendMessage && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="text-emerald-700 text-sm">{resendMessage}</p>
              </div>
            )}

            <a
              href="/api/auth/google"
              className={cn(
                "flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-xl text-sm font-semibold",
                "border border-slate-300 text-slate-700 bg-white transition-all duration-150",
                "shadow-sm hover:shadow-md hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98]"
              )}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </a>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-slate-500 font-medium">
                  or sign in with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
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
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <span>⚠</span> {errors.email.message}
                  </p>
                )}
              </div>

              {/* password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register("password")}
                    className={cn(
                      "w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm text-slate-900",
                      "bg-slate-50 placeholder-slate-400 transition-all duration-150",
                      "focus:outline-none focus:ring-2 focus:bg-white",
                      errors.password
                        ? "border-red-400 focus:ring-red-300"
                        : "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-200"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600">
                    ⚠ {errors.password.message}
                  </p>
                )}
              </div>

              {/* forgot password */}
              <div className="flex justify-end -mt-1">
                <Link
                  href="/forgot-password"
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-150",
                  "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  "shadow-md shadow-blue-500/20",
                  "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-slate-500 font-medium">
                  Don't have an account?
                </span>
              </div>
            </div>

            {/* register link */}
            <Link
              href="/register"
              className={cn(
                "flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-sm font-semibold",
                "border-2 border-slate-200 text-slate-700 transition-all duration-150",
                "hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 active:scale-[0.98]"
              )}
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LoginForm />
    </Suspense>
  );
}