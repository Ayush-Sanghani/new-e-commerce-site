export type AddToCartResult = {
  success: boolean;
  message: string;
  requiresAuth?: boolean;
};

export async function addToCart(productId: string, quantity = 1): Promise<AddToCartResult> {
  try {
    const res = await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });

    const data = (await res.json()) as { success?: boolean; message?: string };
    if (res.status === 401) {
      return {
        success: false,
        message: "Please login to add items to cart.",
        requiresAuth: true,
      };
    }
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || "Unable to add item to cart.",
      };
    }

    return {
      success: true,
      message: data.message || "Item added to cart.",
    };
  } catch {
    return {
      success: false,
      message: "Network error while adding item to cart.",
    };
  }
}
