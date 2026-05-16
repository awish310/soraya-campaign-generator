import { NextResponse } from 'next/server';
import {
  getKv,
  COUNTER_KEYS,
  enumerateDays,
  getReloads,
  setReloads,
  newReloadId,
  type CreditReload,
} from '@/lib/kv';
import { HAT_VALUES, PLATFORM_VALUES, MESSAGE_LANGUAGES } from '@/lib/persona';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 30;

const ANTHROPIC_BASE = 'https://api.anthropic.com';
const ANTHROPIC_VERSION = '2023-06-01';

type BucketWidth = '1m' | '1h' | '1d';

interface UsageResult {
  model: string | null;
  uncached_input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation: {
    ephemeral_1h_input_tokens: number;
    ephemeral_5m_input_tokens: number;
  };
  server_tool_use?: { web_search_requests: number };
}

interface UsageBucket {
  starting_at: string;
  ending_at: string;
  results: UsageResult[];
}

interface CostResult {
  amount: string;
  currency: string;
  description: string | null;
  model: string | null;
  token_type: string | null;
}

interface CostBucket {
  starting_at: string;
  ending_at: string;
  results: CostResult[];
}

interface AnthropicPaged<T> {
  data: T[];
  has_more: boolean;
  next_page: string | null;
}

async function fetchAllPages<T>(url: string): Promise<T[]> {
  const adminKey = process.env.ANTHROPIC_ADMIN_KEY;
  if (!adminKey) {
    throw new Error('ANTHROPIC_ADMIN_KEY not configured');
  }

  const items: T[] = [];
  let cursor: string | null = null;

  for (let i = 0; i < 20; i++) {
    const pagedUrl = cursor
      ? `${url}${url.includes('?') ? '&' : '?'}page=${encodeURIComponent(cursor)}`
      : url;
    const res = await fetch(pagedUrl, {
      headers: {
        'x-api-key': adminKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Anthropic ${res.status}: ${body.slice(0, 200)}`);
    }
    const json = (await res.json()) as AnthropicPaged<T>;
    items.push(...json.data);
    if (!json.has_more || !json.next_page) break;
    cursor = json.next_page;
  }
  return items;
}

function snapToBucket(iso: string, bucket: BucketWidth): string {
  const d = new Date(iso);
  if (bucket === '1d') d.setUTCHours(0, 0, 0, 0);
  else if (bucket === '1h') d.setUTCMinutes(0, 0, 0);
  else d.setUTCSeconds(0, 0);
  return d.toISOString();
}

// Snap an "ending" timestamp UP to the next bucket boundary so the bucket
// containing this timestamp is included in the response.
function snapToBucketEnd(iso: string, bucket: BucketWidth): string {
  const d = new Date(iso);
  if (bucket === '1d') {
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() + 1);
  } else if (bucket === '1h') {
    d.setUTCMinutes(0, 0, 0);
    d.setUTCHours(d.getUTCHours() + 1);
  } else {
    d.setUTCSeconds(0, 0);
    d.setUTCMinutes(d.getUTCMinutes() + 1);
  }
  return d.toISOString();
}

function parseQuery(url: URL): {
  from: string;
  to: string;
  bucket: BucketWidth;
  error?: string;
} {
  const bucketParam = url.searchParams.get('bucket') ?? '1h';
  const bucket: BucketWidth =
    bucketParam === '1m' || bucketParam === '1h' || bucketParam === '1d'
      ? bucketParam
      : '1h';

  const now = new Date();
  const toParam = url.searchParams.get('to');
  const fromParam = url.searchParams.get('from');

  const to = toParam ? new Date(toParam) : now;
  let from: Date;
  if (fromParam) {
    from = new Date(fromParam);
  } else {
    // default: 24h back
    from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
  }

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return { from: '', to: '', bucket, error: 'Invalid from/to timestamps' };
  }
  if (from >= to) {
    return { from: '', to: '', bucket, error: 'from must be before to' };
  }

  return {
    from: snapToBucket(from.toISOString(), bucket),
    to: snapToBucketEnd(to.toISOString(), bucket),
    bucket,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { from, to, bucket, error } = parseQuery(url);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    // Usage report: at requested bucket width, grouped by model
    const usageUrl = `${ANTHROPIC_BASE}/v1/organizations/usage_report/messages?starting_at=${encodeURIComponent(from)}&ending_at=${encodeURIComponent(to)}&bucket_width=${bucket}&group_by[]=model&limit=${bucketLimit(bucket)}`;

    // Cost report: only supports 1d. For ranges shorter than a day we still
    // fetch the daily cost so the dashboard can show "cost today".
    const costFrom = snapToBucket(from, '1d');
    const costTo = snapToBucketEnd(to, '1d');
    const costUrl = `${ANTHROPIC_BASE}/v1/organizations/cost_report?starting_at=${encodeURIComponent(costFrom)}&ending_at=${encodeURIComponent(costTo)}&bucket_width=1d&group_by[]=description&limit=31`;

    // Lifetime cost (for balance calc): from earliest credit reload → now.
    // Falls back to INITIAL_CREDITS_DATE env var, then a 90-day window.
    const reloads = await loadOrSeedReloads();
    const totalCreditsUsd = reloads.reduce((acc, r) => acc + r.amountUsd, 0);
    const earliestReload = reloads.reduce<string | null>((acc, r) => {
      if (!acc || r.date < acc) return r.date;
      return acc;
    }, null);
    const initialDate =
      earliestReload ??
      process.env.INITIAL_CREDITS_DATE ??
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const lifetimeFrom = snapToBucket(initialDate, '1d');
    const lifetimeTo = snapToBucketEnd(new Date().toISOString(), '1d');
    const lifetimeCostUrl = `${ANTHROPIC_BASE}/v1/organizations/cost_report?starting_at=${encodeURIComponent(lifetimeFrom)}&ending_at=${encodeURIComponent(lifetimeTo)}&bucket_width=1d&limit=31`;

    const [usageBuckets, costBuckets, lifetimeCostBuckets] = await Promise.all([
      fetchAllPages<UsageBucket>(usageUrl),
      fetchAllPages<CostBucket>(costUrl),
      fetchAllPages<CostBucket>(lifetimeCostUrl),
    ]);

    // cost_report has ~24h aggregation lag. To get a realtime balance we
    // compute the gap [latest cost bucket end → now] from usage_report and
    // add it to the lifetime cost from cost_report.
    const nowIso = new Date().toISOString();
    const gapStart = latestEndingAt(lifetimeCostBuckets) ?? lifetimeFrom;
    let gapCostUsd = 0;
    if (new Date(gapStart) < new Date(nowIso)) {
      const gapUsageUrl = `${ANTHROPIC_BASE}/v1/organizations/usage_report/messages?starting_at=${encodeURIComponent(gapStart)}&ending_at=${encodeURIComponent(snapToBucketEnd(nowIso, '1h'))}&bucket_width=1h&group_by[]=model&limit=168`;
      const gapUsage = await fetchAllPages<UsageBucket>(gapUsageUrl);
      gapCostUsd = computeUsageCost(gapUsage);
    }

    const reportedCostUsd = sumCostUsd(lifetimeCostBuckets);
    const lifetimeCostUsd = reportedCostUsd + gapCostUsd;
    const balanceUsd = totalCreditsUsd - lifetimeCostUsd;

    // Generation counters from KV. Fail open: if KV isn't configured or
    // the read fails, return null counters rather than erroring the page.
    const generations = await readGenerationCounters(from, to);

    return NextResponse.json({
      range: { from, to, bucket },
      balance: {
        initialCreditsUsd: totalCreditsUsd,
        spentSinceInitialUsd: lifetimeCostUsd,
        reportedCostUsd,
        estimatedRecentCostUsd: gapCostUsd,
        currentBalanceUsd: balanceUsd,
        initialDate,
        gapStart,
        reloadCount: reloads.length,
      },
      generations,
      usage: usageBuckets.map((b) => ({
        starting_at: b.starting_at,
        ending_at: b.ending_at,
        results: b.results,
      })),
      cost: costBuckets.map((b) => ({
        starting_at: b.starting_at,
        ending_at: b.ending_at,
        results: b.results.map((r) => ({
          ...r,
          amountUsd: Number(r.amount) / 100,
        })),
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

function bucketLimit(bucket: BucketWidth): number {
  if (bucket === '1m') return 1440;
  if (bucket === '1h') return 168;
  return 31;
}

function sumCostUsd(buckets: CostBucket[]): number {
  let totalCents = 0;
  for (const b of buckets) {
    for (const r of b.results) {
      totalCents += Number(r.amount) || 0;
    }
  }
  return totalCents / 100;
}

// USD per million tokens, 0-200k context window.
// cost_report has ~24h aggregation lag, so we fall back to computing today's
// cost from usage_report using these prices.
interface ModelPricing {
  input: number;
  output: number;
  cacheWrite5m: number;
  cacheWrite1h: number;
  cacheRead: number;
}

const MODEL_PRICING: Record<string, ModelPricing> = {
  'claude-sonnet-4-6': {
    input: 3,
    output: 15,
    cacheWrite5m: 3.75,
    cacheWrite1h: 6,
    cacheRead: 0.3,
  },
  'claude-opus-4-7': {
    input: 15,
    output: 75,
    cacheWrite5m: 18.75,
    cacheWrite1h: 30,
    cacheRead: 1.5,
  },
  'claude-haiku-4-5': {
    input: 1,
    output: 5,
    cacheWrite5m: 1.25,
    cacheWrite1h: 2,
    cacheRead: 0.1,
  },
};

const DEFAULT_PRICING = MODEL_PRICING['claude-sonnet-4-6'];

function priceFor(model: string | null): ModelPricing {
  if (!model) return DEFAULT_PRICING;
  // Match by prefix so "claude-haiku-4-5-20251001" maps to "claude-haiku-4-5"
  for (const key of Object.keys(MODEL_PRICING)) {
    if (model.startsWith(key)) return MODEL_PRICING[key];
  }
  return DEFAULT_PRICING;
}

function computeUsageCost(buckets: UsageBucket[]): number {
  let total = 0;
  for (const b of buckets) {
    for (const r of b.results) {
      const p = priceFor(r.model);
      total += (r.uncached_input_tokens / 1_000_000) * p.input;
      total += (r.output_tokens / 1_000_000) * p.output;
      total += (r.cache_read_input_tokens / 1_000_000) * p.cacheRead;
      total +=
        (r.cache_creation.ephemeral_5m_input_tokens / 1_000_000) *
        p.cacheWrite5m;
      total +=
        (r.cache_creation.ephemeral_1h_input_tokens / 1_000_000) *
        p.cacheWrite1h;
    }
  }
  return total;
}

// Same migration logic as /api/admin/credits: if KV has no reloads yet but
// env vars define an initial reload, seed it once. Keeps balance calc and
// credits list in sync after switching from env-only to KV-backed credits.
async function loadOrSeedReloads(): Promise<CreditReload[]> {
  const existing = await getReloads();
  if (existing.length > 0) return existing;

  const seedAmount = Number(process.env.INITIAL_CREDITS_USD ?? '');
  const seedDate = process.env.INITIAL_CREDITS_DATE;
  if (!Number.isFinite(seedAmount) || seedAmount <= 0 || !seedDate) return [];

  const seeded: CreditReload[] = [
    {
      id: newReloadId(),
      amountUsd: seedAmount,
      date: seedDate,
      note: 'נטען מ-env var (מיגרציה אוטומטית)',
    },
  ];
  try {
    await setReloads(seeded);
  } catch (err) {
    console.error('[metrics] credits seed failed', err);
  }
  return seeded;
}

function latestEndingAt(buckets: { ending_at: string }[]): string | null {
  if (buckets.length === 0) return null;
  let latest = buckets[0].ending_at;
  for (const b of buckets) {
    if (b.ending_at > latest) latest = b.ending_at;
  }
  return latest;
}

interface GenerationCounters {
  total: number;
  rangeTotal: number;
  byDay: Array<{ day: string; count: number }>;
  byHat: Array<{ key: string; count: number }>;
  byPlatform: Array<{ key: string; count: number }>;
  byLanguage: Array<{ key: string; count: number }>;
}

async function readGenerationCounters(
  from: string,
  to: string,
): Promise<GenerationCounters | null> {
  const kv = getKv();
  if (!kv) return null;

  try {
    const days = enumerateDays(from, to);
    const hatKeys = HAT_VALUES.map((h) => COUNTER_KEYS.hat(h));
    const platformKeys = PLATFORM_VALUES.map((p) => COUNTER_KEYS.platform(p));
    const langKeys = MESSAGE_LANGUAGES.map((l) => COUNTER_KEYS.language(l.value));
    const dayKeys = days.map((d) => COUNTER_KEYS.day(d));

    const allKeys = [
      COUNTER_KEYS.total,
      ...dayKeys,
      ...hatKeys,
      ...platformKeys,
      ...langKeys,
    ];

    // mget returns null for missing keys; treat as 0.
    const values = (await kv.mget(...allKeys)) as Array<string | number | null>;

    const toNum = (v: string | number | null): number => {
      if (v === null) return 0;
      const n = typeof v === 'number' ? v : Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    let idx = 0;
    const total = toNum(values[idx++]);
    const byDay = days.map((day) => ({ day, count: toNum(values[idx++]) }));
    const byHat = HAT_VALUES.map((key) => ({ key, count: toNum(values[idx++]) }));
    const byPlatform = PLATFORM_VALUES.map((key) => ({
      key,
      count: toNum(values[idx++]),
    }));
    const byLanguage = MESSAGE_LANGUAGES.map((l) => ({
      key: l.value,
      count: toNum(values[idx++]),
    }));

    const rangeTotal = byDay.reduce((acc, d) => acc + d.count, 0);

    return { total, rangeTotal, byDay, byHat, byPlatform, byLanguage };
  } catch (err) {
    console.error('[metrics] KV read failed', err);
    return null;
  }
}
