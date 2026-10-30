const ASIN_PATTERNS = [
  /\/dp\/([A-Z0-9]{10})(?=[/?#]|$)/i,
  /\/gp\/product\/([A-Z0-9]{10})(?=[/?#]|$)/i,
  /\/gp\/aw\/d\/([A-Z0-9]{10})(?=[/?#]|$)/i,
  /\/product\/([A-Z0-9]{10})(?=[/?#]|$)/i,
];

const AMAZON_SHORT_HOSTS = ['amzn.to', 'amzn.eu', 'a.co'];

export const STORES = [
  { id: 'amazon', name: 'أمازون', hosts: ['amazon.sa', 'amazon.ae', 'amazon.com', ...AMAZON_SHORT_HOSTS] },
  { id: 'noon', name: 'نون', hosts: ['noon.com', 'noon.link'] },
  { id: 'temu', name: 'تيمو', hosts: ['temu.com', 'temu.to'] },
  { id: 'shein', name: 'شي إن', hosts: ['shein.com', 'onelink.shein.com'] },
  { id: 'aliexpress', name: 'علي إكسبريس', hosts: ['aliexpress.com', 'aliexpress.us'] },
  { id: 'namshi', name: 'نمشي', hosts: ['namshi.com'] },
];

const OTHER_STORE = { id: 'other', name: null, hosts: [] };

function hostMatches(hostname, host) {
  return hostname === host || hostname.endsWith(`.${host}`);
}

export function detectStore(url) {
  let hostname;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
  return STORES.find((s) => s.hosts.some((h) => hostMatches(hostname, h))) ?? OTHER_STORE;
}

export function extractAsin(url) {
  for (const pattern of ASIN_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1].toUpperCase();
  }
  if (/^[A-Z0-9]{10}$/i.test(url.trim())) return url.trim().toUpperCase();
  return null;
}

export function isAmazonShortLink(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return AMAZON_SHORT_HOSTS.some((h) => hostMatches(hostname, h));
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

const AMAZON = STORES[0];

// Turns the link the admin sent into the URL we publish.
// Amazon: we rebuild the link with our tag, so any Amazon link works.
// Other stores: their affiliate links are generated in the store's dashboard
// (often as unique short links), so we publish them untouched — resolving or
// rewriting them would strip the tracking.
export async function resolveDealLink(link, { domain, tag }) {
  if (extractAsin(link) && !/^https?:\/\//i.test(link)) {
    return amazonDeal(extractAsin(link), { domain, tag });
  }

  const store = detectStore(link);
  if (!store) return { error: 'الرابط غير صحيح. انسخ رابط المنتج كامل ويبدأ بـ https://' };

  if (store.id === 'amazon') {
    let url = link;
    if (isAmazonShortLink(url)) {
      try {
        url = await resolveShortLink(url);
      } catch (err) {
        console.error('Short link resolve failed:', err.message);
      }
    }
    const asin = extractAsin(url);
    if (!asin) return { error: 'ما لقيت رقم المنتج (ASIN) في رابط أمازون. انسخ رابط صفحة المنتج كامل.' };
    return amazonDeal(asin, { domain, tag });
  }

  const { hostname, pathname } = new URL(link);
  return { store, url: link, key: `${store.id}:${hostname}${pathname}` };
}

function amazonDeal(asin, { domain, tag }) {
  if (!tag) return { error: 'كود عمولة أمازون (AMAZON_TAG) غير موجود في الإعدادات.' };
  return { store: AMAZON, url: affiliateLink(asin, { domain, tag }), key: `amazon:${asin}` };
}
