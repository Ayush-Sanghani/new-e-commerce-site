import { Clock } from "lucide-react";

type PaymentsComingSoonNoticeProps = {
  className?: string;
};

export function PaymentsComingSoonNotice({ className = "" }: PaymentsComingSoonNoticeProps) {
  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 ${className}`}
    >
      <div className="flex gap-2">
        <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          Online payments are coming soon. Your order is saved — we&apos;ll notify you when checkout
          is available. Sorry for the inconvenience.
        </p>
      </div>
    </div>
  );
}
