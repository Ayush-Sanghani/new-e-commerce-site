import Razorpay from "razorpay";

let instance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (instance) return instance;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
  }
  instance = new Razorpay({ key_id, key_secret });
  return instance;
}

export function getRazorpayKeyId(): string {
  const key_id = process.env.RAZORPAY_KEY_ID;
  if (!key_id) {
    throw new Error("Missing RAZORPAY_KEY_ID");
  }
  return key_id;
}
