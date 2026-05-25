export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}
