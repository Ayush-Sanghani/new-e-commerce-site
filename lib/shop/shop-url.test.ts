import { describe, expect, it } from "vitest";
import { buildShopUrl } from "./shop-url";
import {
  normalizeShopSearchParams,
  shopStateToApiSearchParams,
} from "./listing-params";
import { parseProductListQuery } from "@/lib/validations/product-query";

describe("buildShopUrl", () => {
  it("builds search URLs for nav", () => {
    expect(buildShopUrl({ search: "macbook" })).toBe("/shop?search=macbook");
  });

  it("builds category URLs for home categories", () => {
    expect(buildShopUrl({ category: "smartphones" })).toBe(
      "/shop?category=smartphones"
    );
  });

  it("builds sort URLs used by hero and sections", () => {
    expect(buildShopUrl({ sort: "rating" })).toBe("/shop?sort=rating");
    expect(buildShopUrl({ sort: "latest" })).toBe("/shop?sort=latest");
  });
});

describe("shop listing param round-trip", () => {
  it("maps sort=rating to API rating desc", () => {
    const normalized = normalizeShopSearchParams({ sort: "rating" });
    const api = shopStateToApiSearchParams({
      q: normalized.search,
      sort: normalized.sort,
      page: normalized.page,
    });
    const parsed = parseProductListQuery(api);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.sortKey).toBe("rating");
      expect(parsed.data.sortOrder).toBe("desc");
    }
  });

  it("maps sort=latest to API createdAt desc", () => {
    const normalized = normalizeShopSearchParams({ sort: "latest" });
    const api = shopStateToApiSearchParams({
      q: normalized.search,
      sort: normalized.sort,
      page: normalized.page,
    });
    const parsed = parseProductListQuery(api);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.sortKey).toBe("createdAt");
      expect(parsed.data.sortOrder).toBe("desc");
    }
  });

  it("maps search param to API q", () => {
    const normalized = normalizeShopSearchParams({ search: "phone" });
    const api = shopStateToApiSearchParams({
      q: normalized.search,
      sort: normalized.sort,
      page: normalized.page,
    });
    const parsed = parseProductListQuery(api);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.q).toBe("phone");
    }
  });
});
