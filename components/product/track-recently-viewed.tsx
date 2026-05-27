"use client";

import { useEffect } from "react";
import { trackRecentlyViewed } from "@/lib/wishlist-storage";

type TrackRecentlyViewedProps = {
  productId: string;
};

export function TrackRecentlyViewed({ productId }: TrackRecentlyViewedProps) {
  useEffect(() => {
    trackRecentlyViewed(productId);
  }, [productId]);

  return null;
}
