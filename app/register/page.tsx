"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
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

const stepLabels = [
  "Create your account",
  "Verify your email",
  "You're all set!",
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState("");
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const steps = stepLabels.map((label, i) => ({
    label,
    active: i + 1 <= currentStep,
  }));

  const onResend = async () => {
    if (!registeredEmail) return;

    setIsResending(true);
    setResendMessage(null);
    setServerError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
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
        setRegisteredEmail(data.email);
        setCurrentStep(2);
      } else {
        setServerError(result.error || result.message || "Registration failed. Try again.");
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
              VrajPharma
            </span>
          </div>

          {/* center */}
          <div className="space-y-8">
            <div>
              <p className="text-purple-300 text-base font-semibold mb-4">
                Get started
              </p>
              <h2 className="text-4xl font-bold text-white leading-tight">
                Join VrajPharma
                <br />
                today
              </h2>
              <p className="text-purple-200/80 text-base mt-4 leading-relaxed">
                Create your free account in seconds and start shopping smarter.
              </p>
            </div>

            {/* steps */}
            <div className="flex flex-col gap-0">
              {steps.map((step, i) => (
                <div key={step.label} className="flex gap-4">
                  {/* number + connector */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10",
                        step.active
                          ? "bg-purple-500 text-white"
                          : "bg-white/10 border border-white/20 text-purple-300"
                      )}
                    >
                      {i + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px flex-1 my-1 bg-white/15" />
                    )}
                  </div>
                  {/* label */}
                  <div className={cn("pb-5", i === steps.length - 1 && "pb-0")}>
                    <span
                      className={cn(
                        "text-sm leading-[2rem]",
                        step.active ? "text-white font-medium" : "text-purple-300/70"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-purple-400/60 text-xs">
            © 2026 VrajPharma. All rights reserved.
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
            <span className="text-slate-900 font-bold text-xl">VrajPharma</span>
          </div>

          {/* card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 p-8">
            {currentStep === 2 ? (
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-violet-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  We sent a verification link to{" "}
                  <span className="font-medium text-slate-700">{registeredEmail}</span>.
                  Click the link to verify your account. It expires in 24 hours.
                </p>

                {serverError && (
                  <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 text-left">
                    <p className="text-red-700 text-sm">{serverError}</p>
                  </div>
                )}

                {resendMessage && (
                  <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-left">
                    <p className="text-emerald-700 text-sm">{resendMessage}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onResend}
                  disabled={isResending}
                  className={cn(
                    "mt-8 w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-150",
                    "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]",
                    "disabled:opacity-60 disabled:cursor-not-allowed"
                  )}
                >
                  {isResending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    "Resend verification email"
                  )}
                </button>

                <Link
                  href="/login"
                  className="mt-6 inline-block text-sm font-semibold text-violet-600 hover:text-violet-800"
                >
                  Back to Sign in
                </Link>
              </div>
            ) : (
              <>
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700"
                >
                  Full name{" "}
                  <span className="ml-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
                    optional
                  </span>
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
                  <Link
                    href="/terms-and-conditions"
                    className="font-medium text-violet-600 underline underline-offset-2 hover:text-violet-800"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy-policy"
                    className="font-medium text-violet-600 underline underline-offset-2 hover:text-violet-800"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
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
                <span className="bg-white px-3 text-sm text-slate-500 font-medium">
                  Already have an account?
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
