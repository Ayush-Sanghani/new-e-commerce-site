import { describe, expect, it } from "vitest";
import {
  buildShippingAddressFromProfile,
  isShippingAddressComplete,
} from "./checkout-shipping";

const completeProfile = {
  phone: "9876543210",
  addressLine1: "12 Main St",
  addressLine2: "Apt 4",
  city: "Mumbai",
  state: "MH",
  postalCode: "400001",
  country: "India",
};

describe("isShippingAddressComplete", () => {
  it("returns false when name or required profile fields are missing", () => {
    expect(isShippingAddressComplete("", completeProfile)).toBe(false);
    expect(isShippingAddressComplete("Alex", null)).toBe(false);
    expect(
      isShippingAddressComplete("Alex", { ...completeProfile, city: "" })
    ).toBe(false);
  });

  it("returns true when name and required profile fields are present", () => {
    expect(isShippingAddressComplete("Alex", completeProfile)).toBe(true);
  });
});

describe("buildShippingAddressFromProfile", () => {
  it("maps profile fields and omits empty address line 2", () => {
    expect(
      buildShippingAddressFromProfile("Alex", {
        ...completeProfile,
        addressLine2: "  ",
      })
    ).toEqual({
      name: "Alex",
      phone: "9876543210",
      addressLine1: "12 Main St",
      city: "Mumbai",
      state: "MH",
      postalCode: "400001",
      country: "India",
    });
  });

  it("includes address line 2 when set", () => {
    expect(buildShippingAddressFromProfile("Alex", completeProfile)).toMatchObject({
      addressLine2: "Apt 4",
    });
  });
});
