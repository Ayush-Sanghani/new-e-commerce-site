import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { getClientIp } from "@/lib/rate-limit";

describe("getClientIp", () => {
  it("uses the first x-forwarded-for address", () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      headers: { "x-forwarded-for": "203.0.113.1, 70.41.3.18" },
    });
    expect(getClientIp(request)).toBe("203.0.113.1");
  });

  it("falls back to x-real-ip", () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      headers: { "x-real-ip": "198.51.100.2" },
    });
    expect(getClientIp(request)).toBe("198.51.100.2");
  });

  it("returns unknown when no proxy headers", () => {
    const request = new NextRequest("http://localhost/api/auth/login");
    expect(getClientIp(request)).toBe("unknown");
  });
});
