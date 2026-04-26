type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  actionHref?: string;
};

export function SectionHeader({
  title,
  actionLabel,
  actionHref = "#",
}: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      {actionLabel ? (
        <a
          href={actionHref}
          className="text-sm font-semibold text-blue-700 hover:underline"
        >
          {actionLabel}
        </a>
      ) : null}
    </div>
  );
}
