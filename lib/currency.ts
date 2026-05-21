import { formatInr } from "@/lib/pricing";

/**
 * @deprecated Amounts in the app are stored as INR. Use `formatInr` from `@/lib/pricing`.
 * This alias formats the number as INR without currency conversion.
 */
export function formatInrFromUsd(inrAmount: number) {
  return formatInr(inrAmount);
}
