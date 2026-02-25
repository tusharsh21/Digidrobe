import {
  getHostnameFromHttpUrl,
  getPathnameFromHttpUrl,
  normalizeHttpUrl,
  resolveHttpUrl,
} from './urlHelpers';

const IMAGE_EXT_REGEX = /\.(png|jpe?g|webp|heic|heif)(\?|#|$)/i;
const BAD_IMAGE_HINTS = /(logo|icon|sprite|placeholder|avatar|favicon|banner)/i;

const KNOWN_PRODUCT_CDNS = [
  'myntra',
  'myntraassets',
  'm.media-amazon',
  'images-na.ssl-images-amazon',
  'rukminim',
  'flipkart',
  'fkcdn',
  'shopify',
  'cloudfront',
  'cdn',
];

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\\u0026/gi, '&')
    .replace(/\\\//g, '/');

const asAbsoluteUrl = (candidate: string, baseUrl: string) => {
  const cleaned = decodeHtmlEntities(candidate.trim());
  const resolved = resolveHttpUrl(cleaned, baseUrl);
  if (!resolved || !/^https?:\/\//i.test(resolved)) return null;
  return resolved;
};

const normalizeUrlInput = (rawUrl: string) => {
  const trimmed = rawUrl.trim();
  if (!trimmed) throw new Error('Please provide a product link.');
  return normalizeHttpUrl(trimmed);
};

const addCandidate = (list: string[], set: Set<string>, raw: string, baseUrl: string) => {
  const absolute = asAbsoluteUrl(raw, baseUrl);
  if (!absolute) return;
  if (set.has(absolute)) return;
  set.add(absolute);
  list.push(absolute);
};

const collectMetaCandidates = (html: string, baseUrl: string, list: string[], set: Set<string>) => {
  const metaPattern =
    /<meta[^>]+(?:property|name)\s*=\s*["'](og:image|og:image:secure_url|twitter:image|twitter:image:src)["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let match = metaPattern.exec(html);
  while (match) {
    if (match[2]) addCandidate(list, set, match[2], baseUrl);
    match = metaPattern.exec(html);
  }

  const linkPattern = /<link[^>]+rel\s*=\s*["']image_src["'][^>]+href\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let linkMatch = linkPattern.exec(html);
  while (linkMatch) {
    if (linkMatch[1]) addCandidate(list, set, linkMatch[1], baseUrl);
    linkMatch = linkPattern.exec(html);
  }
};

const collectJsonImages = (value: unknown, out: string[]) => {
  if (typeof value === 'string') {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectJsonImages(item, out);
    return;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const targetKeys = ['image', 'thumbnailUrl', 'contentUrl', 'hiRes', 'large', 'mainUrl', 'src'];
    for (const key of Object.keys(record)) {
      const current = record[key];
      if (targetKeys.includes(key)) {
        collectJsonImages(current, out);
      } else if (typeof current === 'object' || Array.isArray(current)) {
        collectJsonImages(current, out);
      }
    }
  }
};

const collectJsonLdCandidates = (html: string, baseUrl: string, list: string[], set: Set<string>) => {
  const scriptPattern =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch = scriptPattern.exec(html);
  while (scriptMatch) {
    const rawJson = decodeHtmlEntities(scriptMatch[1] || '').trim();
    if (rawJson) {
      try {
        const parsed = JSON.parse(rawJson);
        const jsonImages: string[] = [];
        collectJsonImages(parsed, jsonImages);
        for (const candidate of jsonImages) addCandidate(list, set, candidate, baseUrl);
      } catch {
        // Ignore malformed JSON-LD blocks.
      }
    }
    scriptMatch = scriptPattern.exec(html);
  }
};

const collectPatternCandidates = (html: string, baseUrl: string, list: string[], set: Set<string>) => {
  const patterns = [
    /"hiRes"\s*:\s*"([^"]+)"/gi,
    /"large"\s*:\s*"([^"]+)"/gi,
    /"mainUrl"\s*:\s*"([^"]+)"/gi,
    /"image"\s*:\s*"([^"]+\.(?:png|jpe?g|webp|heic|heif)[^"]*)"/gi,
  ];

  for (const pattern of patterns) {
    let match = pattern.exec(html);
    while (match) {
      if (match[1]) addCandidate(list, set, match[1], baseUrl);
      match = pattern.exec(html);
    }
  }
};

const scoreCandidate = (candidate: string, productHost: string) => {
  let score = 0;
  const host = (getHostnameFromHttpUrl(candidate) || '').toLowerCase();
  const pathname = getPathnameFromHttpUrl(candidate).toLowerCase();
  if (!host) return score;

  if (host.includes(productHost)) score += 4;
  if (KNOWN_PRODUCT_CDNS.some((hint) => host.includes(hint))) score += 6;
  if (IMAGE_EXT_REGEX.test(candidate)) score += 4;
  if (/(product|images|media|catalog)/i.test(pathname)) score += 2;
  if (BAD_IMAGE_HINTS.test(candidate)) score -= 8;
  if (candidate.length > 300) score -= 1;

  return score;
};

const probeImageUrl = async (candidate: string, refererUrl: string) => {
  const headers = {
    Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 13; DigidrobeApp)',
    Referer: refererUrl,
  };

  try {
    const head = await fetch(candidate, { method: 'HEAD', headers });
    if (head.ok) {
      const contentType = (head.headers.get('content-type') || '').toLowerCase();
      if (contentType.startsWith('image/')) return true;
      if (IMAGE_EXT_REGEX.test(candidate) && !contentType.includes('text/html')) return true;
    }
  } catch {
    // Fall through to GET probe.
  }

  try {
    const get = await fetch(candidate, {
      method: 'GET',
      headers: { ...headers, Range: 'bytes=0-32' },
    });

    if (!get.ok) return false;
    const contentType = (get.headers.get('content-type') || '').toLowerCase();
    if (contentType.startsWith('image/')) return true;
    if (IMAGE_EXT_REGEX.test(candidate) && !contentType.includes('text/html')) return true;
  } catch {
    return false;
  }

  return false;
};

export const resolveImageUrlFromProductLink = async (rawUrl: string) => {
  const productUrl = normalizeUrlInput(rawUrl);

  if (IMAGE_EXT_REGEX.test(productUrl)) {
    return productUrl;
  }

  const response = await fetch(productUrl, {
    method: 'GET',
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 13; DigidrobeApp)',
    },
  });

  if (!response.ok) {
    throw new Error(`Could not open product page (${response.status}).`);
  }

  const html = await response.text();
  const productHost = (getHostnameFromHttpUrl(productUrl) || '').toLowerCase();

  const candidateList: string[] = [];
  const candidateSet = new Set<string>();

  collectMetaCandidates(html, productUrl, candidateList, candidateSet);
  collectJsonLdCandidates(html, productUrl, candidateList, candidateSet);
  collectPatternCandidates(html, productUrl, candidateList, candidateSet);

  if (candidateList.length === 0) {
    throw new Error('Could not find a usable product image from this link.');
  }

  const ranked = candidateList.sort(
    (a, b) => scoreCandidate(b, productHost) - scoreCandidate(a, productHost)
  );

  for (const candidate of ranked.slice(0, 8)) {
    const ok = await probeImageUrl(candidate, productUrl);
    if (ok) return candidate;
  }

  return ranked[0];
};
