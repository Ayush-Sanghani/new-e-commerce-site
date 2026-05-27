import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type HomeButtonVariant = "primary" | "secondary" | "dark" | "accent" | "outline";

type HomeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: HomeButtonVariant;
  children: ReactNode;
};

const variantClasses: Record<HomeButtonVariant, string> = {
  primary:
    "cursor-pointer rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "cursor-pointer rounded-xl border border-white/50 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60",
  dark: "cursor-pointer rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60",
  accent:
    "cursor-pointer rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60",
  outline:
    "cursor-pointer rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60",
};

export function HomeButton({
  variant = "primary",
  className,
  type = "button",
  children,
  ...props
}: HomeButtonProps) {
  return (
    <button type={type} className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </button>
  );
}
