import { NextResponse } from 'next/server';
import {
  getReloads,
  setReloads,
  newReloadId,
  type CreditReload,
} from '@/lib/kv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Migration: if KV has no reloads yet but env vars define an initial reload,
// seed it on first read so the dashboard stays consistent after switching
// from env-var-only to KV-backed credits.
async function getReloadsWithSeed(): Promise<CreditReload[]> {
  const existing = await getReloads();
  if (existing.length > 0) return existing;

  const seedAmount = Number(process.env.INITIAL_CREDITS_USD ?? '');
  const seedDate = process.env.INITIAL_CREDITS_DATE;
  if (!Number.isFinite(seedAmount) || seedAmount <= 0 || !seedDate) {
    return [];
  }
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
    console.error('[credits] seed failed', err);
  }
  return seeded;
}

export async function GET() {
  try {
    const reloads = await getReloadsWithSeed();
    const totalUsd = reloads.reduce((acc, r) => acc + r.amountUsd, 0);
    return NextResponse.json({ reloads, totalUsd });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseReloadInput(body);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const reloads = await getReloadsWithSeed();
    const next: CreditReload = {
      id: newReloadId(),
      amountUsd: parsed.amountUsd,
      date: parsed.date,
      note: parsed.note,
    };
    reloads.push(next);
    await setReloads(reloads);
    const totalUsd = reloads.reduce((acc, r) => acc + r.amountUsd, 0);
    return NextResponse.json({ reload: next, reloads, totalUsd });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const reloads = await getReloadsWithSeed();
    const filtered = reloads.filter((r) => r.id !== id);
    if (filtered.length === reloads.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    await setReloads(filtered);
    const totalUsd = filtered.reduce((acc, r) => acc + r.amountUsd, 0);
    return NextResponse.json({ reloads: filtered, totalUsd });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function parseReloadInput(
  body: unknown,
): { amountUsd: number; date: string; note?: string } | { error: string } {
  if (typeof body !== 'object' || body === null) {
    return { error: 'Body must be JSON object' };
  }
  const b = body as Record<string, unknown>;

  const amount = Number(b.amountUsd);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: 'amountUsd must be a positive number' };
  }

  const dateRaw = typeof b.date === 'string' ? b.date : '';
  const d = new Date(dateRaw);
  if (isNaN(d.getTime())) {
    return { error: 'date must be a valid ISO timestamp' };
  }

  const note = typeof b.note === 'string' ? b.note.trim() : undefined;

  return { amountUsd: amount, date: d.toISOString(), note: note || undefined };
}
