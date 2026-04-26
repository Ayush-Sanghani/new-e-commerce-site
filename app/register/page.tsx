"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name is too long")
      .optional()
      .or(z.literal("")),
    email: z.string().email("Please enter a valid email address"),
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

type RegisterFormData = z.infer<typeof registerSchema>;

function getPasswordStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score as 0 | 1 | 2 | 3 | 4;
}

const strengthMeta = {
  0: { label: "", barColor: "bg-slate-200", textColor: "" },
  1: { label: "Weak", barColor: "bg-red-500", textColor: "text-red-600" },
  2: { label: "Fair", barColor: "bg-amber-500", textColor: "text-amber-600" },
  3: { label: "Good", barColor: "bg-yellow-400", textColor: "text-yellow-600" },
  4: {
    label: "Strong",
    barColor: "bg-emerald-500",
    textColor: "text-emerald-600",
  },
};

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const { label, barColor, textColor } = strengthMeta[strength];
  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {([1, 2, 3, 4] as const).map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i <= strength ? barColor : "bg-slate-200"
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

const steps = [
  "Create your account",
  "Verify your email",
  "You're all set!",
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name || undefined,
          email: data.email,
          password: data.password,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        setServerError(result.message || "Registration failed. Try again.");
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
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-800 to-indigo-900" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/[0.04]" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full bg-white/[0.04]" />
        <div className="absolute top-1/3 right-0 w-48 h-48 rounded-full bg-white/[0.03] translate-x-1/2" />

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

          {/* center */}
          <div className="space-y-8">
            <div>
              <p className="text-purple-300 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                Get started
              </p>
              <h2 className="text-4xl font-bold text-white leading-tight">
                Join us and
                <br />
                get started
              </h2>
              <p className="text-purple-200/80 text-base mt-4 leading-relaxed">
                Create your free account in seconds and explore your new
                dashboard.
              </p>
            </div>

            {/* steps */}
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={step} className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                      i === 0
                        ? "bg-purple-500 text-white"
                        : "bg-white/10 border border-white/20 text-purple-300"
                    )}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={cn(
                      "text-sm",
                      i === 0 ? "text-white font-medium" : "text-purple-300/70"
                    )}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-purple-400/60 text-xs">
            © 2026 DummyApp. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-md my-4">
          {/* mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-900 font-bold text-xl">DummyApp</span>
          </div>

          {/* card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-slate-900">
                Create account
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Fill in the details below to get started
              </p>
            </div>

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
              {/* name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700"
                >
                  Full name{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    {...register("name")}
                    className={cn(
                      "w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900",
                      "bg-slate-50 placeholder-slate-400 transition-all duration-150",
                      "focus:outline-none focus:ring-2 focus:bg-white",
                      errors.name
                        ? "border-red-400 focus:ring-red-300"
                        : "border-slate-200 hover:border-slate-300 focus:border-violet-500 focus:ring-violet-200"
                    )}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-600">
                    ⚠ {errors.name.message}
                  </p>
                )}
              </div>

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
                        : "border-slate-200 hover:border-slate-300 focus:border-violet-500 focus:ring-violet-200"
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600">
                    ⚠ {errors.email.message}
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
                        : "border-slate-200 hover:border-slate-300 focus:border-violet-500 focus:ring-violet-200"
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
                <PasswordStrengthBar password={passwordValue} />
                {errors.password && (
                  <p className="text-xs text-red-600">
                    ⚠ {errors.password.message}
                  </p>
                )}
              </div>

              {/* confirm password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-slate-700"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    {...register("confirmPassword")}
                    className={cn(
                      "w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm text-slate-900",
                      "bg-slate-50 placeholder-slate-400 transition-all duration-150",
                      "focus:outline-none focus:ring-2 focus:bg-white",
                      errors.confirmPassword
                        ? "border-red-400 focus:ring-red-300"
                        : "border-slate-200 hover:border-slate-300 focus:border-violet-500 focus:ring-violet-200"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600">
                    ⚠ {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* terms hint */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  By creating an account you agree to our{" "}
                  <a
                    href="#"
                    className="text-violet-600 hover:underline font-medium"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-violet-600 hover:underline font-medium"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>

              {/* submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-150",
                  "bg-violet-600 hover:bg-violet-700 active:scale-[0.98]",
                  "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2",
                  "shadow-md shadow-violet-500/20",
                  "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account…
                  </span>
                ) : (
                  "Create Account"
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
                  Have an account?
                </span>
              </div>
            </div>

            {/* login link */}
            <Link
              href="/login"
              className={cn(
                "flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-sm font-semibold",
                "border-2 border-slate-200 text-slate-700 transition-all duration-150",
                "hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 active:scale-[0.98]"
              )}
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
