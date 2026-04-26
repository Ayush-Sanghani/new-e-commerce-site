const FALLBACK_USD_TO_INR_RATE = 83.5;

function getUsdToInrRate() {
  const rawRate = process.env.NEXT_PUBLIC_USD_TO_INR_RATE;
  const parsedRate = rawRate ? Number(rawRate) : NaN;
  return Number.isFinite(parsedRate) && parsedRate > 0
    ? parsedRate
    : FALLBACK_USD_TO_INR_RATE;
}

export function convertUsdToInr(usdAmount: number) {
  const amount = Number.isFinite(usdAmount) ? usdAmount : 0;
  return amount * getUsdToInrRate();
}

export function formatInrFromUsd(usdAmount: number) {
  const inrAmount = convertUsdToInr(usdAmount);
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(inrAmount);
  return `Rs ${formatted}`;
}
