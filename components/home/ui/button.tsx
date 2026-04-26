import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type HomeButtonVariant = "primary" | "secondary" | "dark";

type HomeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: HomeButtonVariant;
  children: ReactNode;
};

const variantClasses: Record<HomeButtonVariant, string> = {
  primary:
    "cursor-pointer rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "cursor-pointer rounded-xl border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60",
  dark: "cursor-pointer rounded-lg bg-blue-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60",
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
