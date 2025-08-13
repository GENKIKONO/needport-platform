// Build URL with search parameters
export function linkWithSearch(base: string, params: Record<string, string | number | boolean>): string {
  const url = new URL(base, "http://localhost");
  
  // Add current search params
  if (typeof window !== "undefined") {
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }
  
  // Override with new params
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  
  return url.pathname + url.search;
}
