import Link from "next/link";
import type { ClientErrorDisplay } from "@/lib/client-api-errors";

type OrderPaymentErrorProps = {
  display: ClientErrorDisplay;
};

export function OrderPaymentError({ display }: OrderPaymentErrorProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      <p>{display.message}</p>
      {display.links.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
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
    </div>
  );
}
