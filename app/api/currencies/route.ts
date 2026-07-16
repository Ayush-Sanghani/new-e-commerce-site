import { NextResponse } from "next/server";
import { listPublicCurrencies } from "@/lib/services/currency";

/**
 * GET /api/currencies — active currencies with live exchange rates for display.
 */
export async function GET() {
  try {
    const data = await listPublicCurrencies();
    return NextResponse.json({
      success: true,
      message: "Currencies fetched.",
      data,
    });
  } catch (err) {
    console.error("GET /api/currencies:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch currencies.", data: null },
      { status: 500 }
    );
  }
}
