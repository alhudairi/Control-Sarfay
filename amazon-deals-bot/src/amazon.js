const ASIN_PATTERNS = [
  /\/dp\/([A-Z0-9]{10})(?=[/?#]|$)/i,
  /\/gp\/product\/([A-Z0-9]{10})(?=[/?#]|$)/i,
  /\/gp\/aw\/d\/([A-Z0-9]{10})(?=[/?#]|$)/i,
  /\/product\/([A-Z0-9]{10})(?=[/?#]|$)/i,
];

const SHORT_LINK_HOSTS = new Set(['amzn.to', 'amzn.eu', 'a.co']);

export function extractAsin(url) {
  for (const pattern of ASIN_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1].toUpperCase();
  }
  if (/^[A-Z0-9]{10}$/i.test(url.trim())) return url.trim().toUpperCase();
  return null;
}

export function isShortLink(url) {
  try {
    return SHORT_LINK_HOSTS.has(new URL(url).hostname.replace(/^www\./, ''));
  } catch {
    return false;
  }
}

// Short links (amzn.to, a.co) only redirect to the product page; we read the
// Location header without downloading the page itself.
export async function resolveShortLink(url) {
  let current = url;
  for (let hop = 0; hop < 5; hop++) {
    const res = await fetch(current, { method: 'HEAD', redirect: 'manual' });
    const location = res.headers.get('location');
    if (!location) return current;
    current = new URL(location, current).toString();
    if (extractAsin(current)) return current;
  }
  return current;
}

export function affiliateLink(asin, { domain, tag }) {
  return `https://${domain}/dp/${asin}?tag=${encodeURIComponent(tag)}`;
}
