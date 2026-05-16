import { Redis } from '@upstash/redis';

let cached: Redis | null = null;

// Returns null if KV is not configured. Callers should fail open (don't
// block generation just because counters can't be written).
export function getKv(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  if (!cached) cached = new Redis({ url, token });
  return cached;
}

// UTC date string (YYYY-MM-DD) for per-day counter keys.
export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dayKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

// Enumerate UTC day strings between two ISO timestamps (inclusive of from, exclusive of to).
export function enumerateDays(fromIso: string, toIso: string): string[] {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  from.setUTCHours(0, 0, 0, 0);
  to.setUTCHours(0, 0, 0, 0);
  const days: string[] = [];
  const cursor = new Date(from);
  while (cursor < to) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

// Counter key namespace
export const COUNTER_KEYS = {
  total: 'gen:total',
  day: (d: string) => `gen:day:${d}`,
  hat: (h: string) => `gen:hat:${h}`,
  platform: (p: string) => `gen:platform:${p}`,
  language: (l: string) => `gen:lang:${l}`,
} as const;

// Credits reload history. Single key holds a JSON array of reload events.
// Total credits granted = sum(reload.amount). Balance = total - cumulative cost.
export const CREDITS_KEY = 'credits:reloads';

export interface CreditReload {
  id: string;
  amountUsd: number;
  date: string; // ISO timestamp
  note?: string;
}

export async function getReloads(): Promise<CreditReload[]> {
  const kv = getKv();
  if (!kv) return [];
  const raw = await kv.get<CreditReload[] | string>(CREDITS_KEY);
  if (!raw) return [];
  // Upstash client may return an object or a string depending on storage path.
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as CreditReload[];
    } catch {
      return [];
    }
  }
  return raw;
}

export async function setReloads(reloads: CreditReload[]): Promise<void> {
  const kv = getKv();
  if (!kv) throw new Error('KV not configured');
  await kv.set(CREDITS_KEY, JSON.stringify(reloads));
}

export function newReloadId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
