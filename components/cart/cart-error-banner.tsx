import Link from "next/link";
import type { ClientErrorDisplay } from "@/lib/client-api-errors";

type CartErrorBannerProps = {
  display: ClientErrorDisplay;
  /** Extra actions for pending-order conflict (cancel button, etc.). */
  children?: React.ReactNode;
};

export function CartErrorBanner({ display, children }: CartErrorBannerProps) {
  return (
    <section className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <p>{display.message}</p>
      {display.links.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {display.links.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className="font-medium text-red-800 underline hover:text-red-950"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
      {children ? <div className="mt-3 space-y-3">{children}</div> : null}
    </section>
  );
}
