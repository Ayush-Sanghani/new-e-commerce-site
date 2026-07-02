import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let databaseOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseOk = true;
  } catch (err) {
    console.error("Health check: database ping failed:", err);
  }

  const status = databaseOk ? "ok" : "error";

  return NextResponse.json(
    {
      status,
      checks: {
        database: databaseOk ? "ok" : "error",
      },
      timestamp: new Date().toISOString(),
    },
    { status: databaseOk ? 200 : 503 }
  );
}
