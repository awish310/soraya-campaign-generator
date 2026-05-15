export type ReelSource = 'facebook' | 'instagram';

export interface Reel {
  id: string;
  url: string;
  source: ReelSource;
  title?: string;
  thumbnail?: string;
}

export const REELS: Reel[] = [
  {
    id: '1639771147353609',
    url: 'https://www.facebook.com/reel/1639771147353609',
    source: 'facebook',
    title: 'ריל מרכז סוראיה',
  },
  {
    id: '1670428084293131',
    url: 'https://www.facebook.com/reel/1670428084293131',
    source: 'facebook',
    title: 'ריל מרכז סוראיה',
  },
  {
    id: 'DYWmOoZIEkP',
    url: 'https://www.instagram.com/reel/DYWmOoZIEkP/',
    source: 'instagram',
    title: 'ריל מרכז סוראיה',
  },
];

export function reelEmbedUrl(reel: Reel): string {
  if (reel.source === 'instagram') {
    // Instagram URLs end without `/embed`; appending it loads the official embed
    // player. Works for /reel/, /p/, and /tv/ paths. Strip query strings first.
    const clean = reel.url.split('?')[0].replace(/\/?$/, '');
    return `${clean}/embed/`;
  }
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
    reel.url,
  )}&show_text=false&t=0`;
}

// Backwards-compatible alias — older callers may still import this name.
export function fbReelEmbedUrl(reelUrl: string): string {
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
    reelUrl,
  )}&show_text=false&t=0`;
}

function isReelSource(value: unknown): value is ReelSource {
  return value === 'facebook' || value === 'instagram';
}

function inferSource(url: string): ReelSource | null {
  if (/(^https?:)?\/\/(www\.)?facebook\.com\//i.test(url)) return 'facebook';
  if (/(^https?:)?\/\/(www\.)?instagram\.com\//i.test(url)) return 'instagram';
  return null;
}

function normalizeReel(value: unknown): Reel | null {
  if (typeof value !== 'object' || value === null) return null;
  const r = value as Record<string, unknown>;
  if (typeof r.id !== 'string' || !r.id) return null;
  if (typeof r.url !== 'string' || !r.url) return null;
  if (r.title !== undefined && typeof r.title !== 'string') return null;
  if (r.thumbnail !== undefined && typeof r.thumbnail !== 'string') return null;

  const source: ReelSource | null = isReelSource(r.source)
    ? r.source
    : inferSource(r.url);
  if (!source) return null;

  return {
    id: r.id,
    url: r.url,
    source,
    title: typeof r.title === 'string' ? r.title : undefined,
    thumbnail: typeof r.thumbnail === 'string' ? r.thumbnail : undefined,
  };
}

// Fetches the live list from /reels.json. Returns null on any failure so the
// caller can fall back to the in-code REELS defaults.
export async function fetchReels(): Promise<Reel[] | null> {
  try {
    const resp = await fetch('/reels.json', { cache: 'no-store' });
    if (!resp.ok) return null;
    const data: unknown = await resp.json();
    if (!Array.isArray(data)) return null;
    const valid = data
      .map(normalizeReel)
      .filter((r): r is Reel => r !== null);
    return valid.length ? valid : null;
  } catch {
    return null;
  }
}
