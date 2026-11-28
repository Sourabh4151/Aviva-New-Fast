export function getCurrentUtmQuery() {
  if (typeof window === "undefined") return "";
  const incoming = new URLSearchParams(window.location.search);
  const utm = new URLSearchParams();
  for (const [key, value] of incoming.entries()) {
    if (key.toLowerCase().startsWith("utm_") && value) {
      utm.set(key, value);
    }
  }
  return utm.toString();
}

export function withUtmParams(url) {
  const qs = getCurrentUtmQuery();
  if (!qs) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${qs}`;
}
