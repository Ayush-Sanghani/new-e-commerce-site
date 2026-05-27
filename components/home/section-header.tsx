import Link from "next/link";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  centered?: boolean;
};

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionHref = "/shop",
  centered = false,
}: SectionHeaderProps) {
  return (
    <div
      className={`mb-6 sm:mb-8 ${centered ? "text-center" : "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"}`}
    >
      <div>
        <h2 className="text-section-title">{title}</h2>
        {subtitle ? (
          <p className="mt-1.5 text-sm text-slate-500 sm:text-base">{subtitle}</p>
        ) : null}
      </div>
      {actionLabel ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:text-primary-hover hover:underline"
        >
          {actionLabel}
          <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}
