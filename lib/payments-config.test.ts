import { afterEach, describe, expect, it } from "vitest";
import { isPaymentsEnabled } from "./payments-config";

describe("isPaymentsEnabled", () => {
  const original = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_PAYMENTS_ENABLED;
    } else {
      process.env.NEXT_PUBLIC_PAYMENTS_ENABLED = original;
    }
  });

  it("returns true only when env is exactly true", () => {
    process.env.NEXT_PUBLIC_PAYMENTS_ENABLED = "true";
    expect(isPaymentsEnabled()).toBe(true);
  });

  it("returns false for unset or other values", () => {
    delete process.env.NEXT_PUBLIC_PAYMENTS_ENABLED;
    expect(isPaymentsEnabled()).toBe(false);

    process.env.NEXT_PUBLIC_PAYMENTS_ENABLED = "false";
    expect(isPaymentsEnabled()).toBe(false);
  });
});
