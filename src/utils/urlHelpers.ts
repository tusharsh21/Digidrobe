const ABSOLUTE_HTTP_REGEX = /^https?:\/\//i;

type ParsedHttpUrl = {
  protocol: 'http' | 'https';
  host: string;
  port: string;
  origin: string;
  pathname: string;
};

const normalizePath = (path: string) => {
  const parts = path.split('/');
  const normalized: string[] = [];

  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      normalized.pop();
      continue;
    }
    normalized.push(part);
  }

  return `/${normalized.join('/')}`;
};

const parseHttpUrl = (value: string): ParsedHttpUrl | null => {
  const match = value.trim().match(/^(https?):\/\/([^\/?#:]+)(:\d+)?(\/[^?#]*)?/i);
  if (!match) return null;

  const protocol = match[1].toLowerCase() as 'http' | 'https';
  const host = match[2];
  const port = match[3] || '';
  const pathname = match[4] || '/';
  const origin = `${protocol}://${host}${port}`;

  return { protocol, host, port, origin, pathname };
};

export const normalizeHttpUrl = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (ABSOLUTE_HTTP_REGEX.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

export const normalizeOptionalHttpUrl = (raw?: string) => {
  if (!raw) return undefined;
  const normalized = normalizeHttpUrl(raw);
  return normalized || undefined;
};

export const getHostnameFromHttpUrl = (raw: string) => {
  const parsed = parseHttpUrl(normalizeHttpUrl(raw));
  return parsed ? parsed.host.replace(/^www\./i, '') : null;
};

export const getOriginFromHttpUrl = (raw: string) => {
  const parsed = parseHttpUrl(normalizeHttpUrl(raw));
  return parsed ? parsed.origin : null;
};

export const getPathnameFromHttpUrl = (raw: string) => {
  const parsed = parseHttpUrl(normalizeHttpUrl(raw));
  return parsed ? parsed.pathname : '/';
};

export const resolveHttpUrl = (candidate: string, baseUrl: string) => {
  const cleaned = candidate.trim();
  if (!cleaned) return null;

  if (ABSOLUTE_HTTP_REGEX.test(cleaned)) {
    return cleaned;
  }

  const base = parseHttpUrl(normalizeHttpUrl(baseUrl));
  if (!base) return null;

  if (cleaned.startsWith('//')) {
    return `${base.protocol}:${cleaned}`;
  }

  if (cleaned.startsWith('/')) {
    return `${base.origin}${cleaned}`;
  }

  const baseDir = base.pathname.endsWith('/')
    ? base.pathname
    : base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1);

  const resolvedPath = normalizePath(`${baseDir}${cleaned}`);
  return `${base.origin}${resolvedPath}`;
};

