/** Routes where product search in the header is useful. */
const NAV_SEARCH_PATTERNS = [
  /^\/home\/?$/,
  /^\/shop\/?$/,
  /^\/shop\/[^/]+\/?$/,
] as const;

export function shouldShowNavSearch(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? "";
  return NAV_SEARCH_PATTERNS.some((pattern) => pattern.test(path));
}
