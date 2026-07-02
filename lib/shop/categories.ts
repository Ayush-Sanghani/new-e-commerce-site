import type { CategoryGroup } from "@/components/home/types";
import type { ShopCategoryChip } from "@/lib/shop/listing-params";

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
};

export function toShopCategoryChips(categories: CatalogCategory[]): ShopCategoryChip[] {
  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
  }));
}

/** Single nav group for header mobile menu category links. */
export function toCategoryGroups(categories: CatalogCategory[]): CategoryGroup[] {
  if (categories.length === 0) return [];

  return [
    {
      title: "Product Categories",
      items: categories.map((category) => ({
        slug: category.slug,
        label: category.name,
      })),
    },
  ];
}
