import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { setCurrencyCookie } from "@/lib/currency-cookie";
import { prisma } from "@/lib/db";
import { enforceApiRateLimit } from "@/lib/rate-limit";
import { getCurrencyContext, listActiveCurrencies } from "@/lib/services/currency";

const bodySchema = z
  .object({
    currency: z.string().trim().min(3).max(3),
  })
  .strict();

/**
 * POST /api/currency — set display-currency cookie (and profile.preferredCurrency when logged in).
 */
export async function POST(request: NextRequest) {
  const limited = await enforceApiRateLimit(request, "currency-preference");
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body.", data: null },
      { status: 400 }
    );
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed.",
        error: parsed.error.flatten().fieldErrors,
        data: null,
      },
      { status: 400 }
    );
  }

  const code = parsed.data.currency.toUpperCase();
  const active = await listActiveCurrencies();
  const allowed = active.some((c) => c.code === code && c.exchangeRate != null);
  if (!allowed) {
    return NextResponse.json(
      { success: false, message: "Currency is not available.", data: null },
      { status: 400 }
    );
  }

  const context = await getCurrencyContext(code);
  if (!context) {
    return NextResponse.json(
      { success: false, message: "Currency rate is not configured.", data: null },
      { status: 400 }
    );
  }

  const user = await getSessionUser(request);
  if (user) {
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        preferredCurrency: code,
      },
      update: {
        preferredCurrency: code,
      },
    });
  }

  const response = NextResponse.json({
    success: true,
    message: "Currency updated.",
    data: {
      currency: context.code,
      symbol: context.symbol,
      decimalDigits: context.decimalDigits,
      rateToInr: context.rateToInr.toNumber(),
      rateUpdatedAt: context.rateUpdatedAt.toISOString(),
      rateStale: context.rateStale,
    },
  });

  return setCurrencyCookie(response, code);
}
