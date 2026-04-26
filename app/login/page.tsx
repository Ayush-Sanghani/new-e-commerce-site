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
  ShieldCheck,
  Zap,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const features = [
  { icon: ShieldCheck, label: "Secure JWT authentication" },
  { icon: Users, label: "Role-based access control" },
  { icon: Zap, label: "Lightning-fast responses" },
];

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);
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
        setServerError(result.message || "Login failed. Please try again.");
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
              DummyApp
            </span>
          </div>

          {/* center content */}
          <div className="space-y-8">
            <div>
              <p className="text-indigo-300 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                Welcome back
              </p>
              <h2 className="text-4xl font-bold text-white leading-tight">
                Sign in to
                <br />
                your workspace
              </h2>
              <p className="text-indigo-200/80 text-base mt-4 leading-relaxed">
                Access your personalized dashboard and manage everything from
                one secure place.
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
            © 2026 DummyApp. All rights reserved.
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
            <span className="text-slate-900 font-bold text-xl">DummyApp</span>
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
                  Account created! Please sign in.
                </p>
              </div>
            )}

            {/* error banner */}
            {serverError && (
              <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-700 text-sm">{serverError}</p>
              </div>
            )}

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
                <a
                  href="#"
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-150",
                  "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                  "shadow-md shadow-indigo-500/20",
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
                <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">
                  New here?
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