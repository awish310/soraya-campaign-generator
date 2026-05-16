'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { HATS, PLATFORMS, MESSAGE_LANGUAGES } from '@/lib/persona';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Bucket = '1m' | '1h' | '1d';

type RangePreset = '24h' | '7d' | '30d' | 'custom';

interface UsageResult {
  model: string | null;
  uncached_input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation: {
    ephemeral_1h_input_tokens: number;
    ephemeral_5m_input_tokens: number;
  };
}

interface GenerationCounters {
  total: number;
  rangeTotal: number;
  byDay: Array<{ day: string; count: number }>;
  byHat: Array<{ key: string; count: number }>;
  byPlatform: Array<{ key: string; count: number }>;
  byLanguage: Array<{ key: string; count: number }>;
}

interface MetricsResponse {
  range: { from: string; to: string; bucket: Bucket };
  balance: {
    initialCreditsUsd: number;
    spentSinceInitialUsd: number;
    currentBalanceUsd: number;
    initialDate: string;
  };
  generations: GenerationCounters | null;
  usage: Array<{
    starting_at: string;
    ending_at: string;
    results: UsageResult[];
  }>;
  cost: Array<{
    starting_at: string;
    ending_at: string;
    results: Array<{ amountUsd: number; model: string | null; description: string | null }>;
  }>;
}

export default function AdminUsagePage() {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preset, setPreset] = useState<RangePreset>('24h');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');

  const range = useMemo(() => computeRange(preset, customFrom, customTo), [
    preset,
    customFrom,
    customTo,
  ]);

  const fetchMetrics = useCallback(async () => {
    if (!range) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        from: range.from,
        to: range.to,
        bucket: range.bucket,
      });
      const res = await fetch(`/api/admin/metrics?${params}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const json = (await res.json()) as MetricsResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'שגיאה לא צפויה');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    if (range) fetchMetrics();
  }, [range, fetchMetrics]);

  return (
    <div className="min-h-screen bg-cream-50 text-forest-900 p-3 sm:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <header className="mb-4 sm:mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-forest-700 hover:text-forest-900 mb-2 sm:mb-3 transition"
          >
            <ArrowRight size={14} />
            <span>חזרה לאפליקציה</span>
          </Link>
          <h1 className="text-xl sm:text-3xl font-bold">לוח שימוש</h1>
          <p className="text-forest-700 text-xs sm:text-sm mt-1">
            מילים לנשום · נתונים מ-Anthropic Admin API
          </p>
        </header>

        <RangeControls
          preset={preset}
          onPresetChange={setPreset}
          customFrom={customFrom}
          customTo={customTo}
          onCustomChange={(from, to) => {
            setCustomFrom(from);
            setCustomTo(to);
          }}
        />

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 rounded-xl p-3 my-4">
            {error}
          </div>
        )}

        {loading && !data && (
          <div className="text-forest-700 my-8 text-center">טוען נתונים...</div>
        )}

        {data && (
          <div className="space-y-3 sm:space-y-6 mt-3 sm:mt-4">
            <Kpis data={data} />
            {data.generations && <GenerationBreakdowns gens={data.generations} />}
            <CreditsManager onChange={fetchMetrics} />
            <CostOverTime data={data} />
            <TokensOverTime data={data} />
            <ModelBreakdown data={data} />
            <CacheCard data={data} />
          </div>
        )}
      </div>
    </div>
  );
}

function RangeControls(props: {
  preset: RangePreset;
  onPresetChange: (p: RangePreset) => void;
  customFrom: string;
  customTo: string;
  onCustomChange: (from: string, to: string) => void;
}) {
  const presets: Array<{ value: RangePreset; label: string }> = [
    { value: '24h', label: '24 שעות' },
    { value: '7d', label: '7 ימים' },
    { value: '30d', label: '30 ימים' },
    { value: 'custom', label: 'טווח מותאם' },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4">
      <div className="grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
        {presets.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => props.onPresetChange(p.value)}
            className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
              props.preset === p.value
                ? 'bg-forest-800 text-cream-50'
                : 'bg-cream-100 text-forest-800 hover:bg-cream-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {props.preset === 'custom' && (
        <div className="flex flex-wrap items-end gap-3 mt-3 pt-3 border-t border-sage-300">
          <label className="text-xs text-forest-700">
            <span className="block mb-1">מ-</span>
            <input
              type="datetime-local"
              value={props.customFrom}
              onChange={(e) => props.onCustomChange(e.target.value, props.customTo)}
              className="px-3 py-2 rounded-lg border border-sage-300 bg-cream-50 text-forest-900"
            />
          </label>
          <label className="text-xs text-forest-700">
            <span className="block mb-1">עד</span>
            <input
              type="datetime-local"
              value={props.customTo}
              onChange={(e) => props.onCustomChange(props.customFrom, e.target.value)}
              className="px-3 py-2 rounded-lg border border-sage-300 bg-cream-50 text-forest-900"
            />
          </label>
        </div>
      )}
    </div>
  );
}

function Kpis({ data }: { data: MetricsResponse }) {
  const totals = useMemo(() => {
    let inTokens = 0;
    let outTokens = 0;
    let cacheRead = 0;
    let cacheCreate = 0;
    let requests = 0;
    for (const b of data.usage) {
      for (const r of b.results) {
        inTokens += r.uncached_input_tokens;
        outTokens += r.output_tokens;
        cacheRead += r.cache_read_input_tokens;
        cacheCreate +=
          (r.cache_creation?.ephemeral_1h_input_tokens ?? 0) +
          (r.cache_creation?.ephemeral_5m_input_tokens ?? 0);
        if (r.output_tokens > 0) requests++;
      }
    }
    let cost = 0;
    for (const b of data.cost) {
      for (const r of b.results) cost += r.amountUsd;
    }
    const totalInput = inTokens + cacheRead + cacheCreate;
    const cacheHitPct = totalInput === 0 ? 0 : (cacheRead / totalInput) * 100;
    return { inTokens, outTokens, cacheRead, requests, cost, cacheHitPct };
  }, [data]);

  const gens = data.generations;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
      <KpiCard
        label="באלאנס נוכחי"
        value={fmtUsd(data.balance.currentBalanceUsd)}
        sub={`מתוך ${fmtUsd(data.balance.initialCreditsUsd)}`}
        highlight
      />
      {gens && (
        <KpiCard
          label="מסרים בטווח"
          value={fmtNum(gens.rangeTotal)}
          sub={`סה״כ: ${fmtNum(gens.total)}`}
        />
      )}
      <KpiCard
        label="עלות בטווח"
        value={fmtUsd(totals.cost)}
        sub="Cost API"
      />
      <KpiCard
        label="טוקנים שיצאו"
        value={fmtNum(totals.outTokens)}
        sub={`קלט: ${fmtNum(totals.inTokens)}`}
      />
      <KpiCard
        label="Cache hit"
        value={`${totals.cacheHitPct.toFixed(1)}%`}
        sub={`${fmtNum(totals.cacheRead)} reads`}
      />
    </div>
  );
}

function GenerationBreakdowns({ gens }: { gens: GenerationCounters }) {
  const hatLabel = useMemo(
    () => Object.fromEntries(HATS.map((h) => [h.value, h.label])),
    [],
  );
  const platformLabel = useMemo(
    () => Object.fromEntries(PLATFORMS.map((p) => [p.value, p.label])),
    [],
  );
  const langLabel = useMemo(
    () => Object.fromEntries(MESSAGE_LANGUAGES.map((l) => [l.value, l.label])),
    [],
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      <BreakdownCard
        title="פילוח לפי כובע"
        subtitle="סה״כ מסרים שנוצרו"
        items={gens.byHat.map((x) => ({
          key: x.key,
          label: hatLabel[x.key] ?? x.key,
          count: x.count,
        }))}
      />
      <BreakdownCard
        title="פילוח לפי פלטפורמה"
        subtitle="סה״כ מסרים שנוצרו"
        items={gens.byPlatform.map((x) => ({
          key: x.key,
          label: platformLabel[x.key] ?? x.key,
          count: x.count,
        }))}
      />
      <BreakdownCard
        title="פילוח לפי שפה"
        subtitle="סה״כ מסרים שנוצרו"
        items={gens.byLanguage.map((x) => ({
          key: x.key,
          label: langLabel[x.key] ?? x.key,
          count: x.count,
        }))}
      />
    </div>
  );
}

function BreakdownCard({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: Array<{ key: string; label: string; count: number }>;
}) {
  const sorted = [...items].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((acc, x) => acc + x.count, 0);
  const palette = ['#2A3B27', '#4A5C44', '#7A6E4C', '#A8B89C', '#DFD3BB'];
  const hasData = total > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4">
      <div className="mb-2 sm:mb-3">
        <h2 className="text-base sm:text-lg font-bold text-forest-900">{title}</h2>
        {subtitle && <p className="text-xs text-forest-700">{subtitle}</p>}
      </div>
      {!hasData && (
        <div className="text-sm text-forest-700 py-4 text-center">
          אין נתונים עדיין
        </div>
      )}
      {hasData && (
        <div className="space-y-2">
          {sorted.map((item, i) => {
            const pct = total === 0 ? 0 : (item.count / total) * 100;
            return (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium text-forest-900 truncate ml-2">
                    {item.label}
                  </span>
                  <span className="text-forest-700 shrink-0">
                    {fmtNum(item.count)}
                    <span className="text-forest-700/60 mr-1">
                      · {pct.toFixed(0)}%
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: palette[i % palette.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm ${
        highlight ? 'bg-forest-800 text-cream-50' : 'bg-white text-forest-900'
      }`}
    >
      <div
        className={`text-[11px] sm:text-xs font-medium ${
          highlight ? 'text-cream-200' : 'text-forest-700'
        }`}
      >
        {label}
      </div>
      <div className="text-xl sm:text-2xl font-bold mt-1">{value}</div>
      {sub && (
        <div
          className={`text-[10px] sm:text-xs mt-1 ${
            highlight ? 'text-cream-300' : 'text-forest-700'
          }`}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function CostOverTime({ data }: { data: MetricsResponse }) {
  const chartData = useMemo(
    () =>
      data.cost.map((b) => ({
        time: fmtDate(b.starting_at, '1d'),
        cost: b.results.reduce((acc, r) => acc + r.amountUsd, 0),
      })),
    [data.cost],
  );

  return (
    <ChartCard title="עלות יומית (USD)" subtitle="Cost API תומך רק בגרנולריות יומית">
      <div className="h-[180px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DFD3BB" />
            <XAxis dataKey="time" stroke="#4A5C44" fontSize={11} />
            <YAxis
              stroke="#4A5C44"
              fontSize={11}
              tickFormatter={(v: number) => `$${v.toFixed(2)}`}
            />
            <Tooltip
              formatter={(v) => fmtUsd(Number(v))}
              contentStyle={{
                direction: 'ltr',
                background: '#FBF5EA',
                border: '1px solid #DFD3BB',
              }}
            />
            <Bar dataKey="cost" fill="#2A3B27" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

function TokensOverTime({ data }: { data: MetricsResponse }) {
  const chartData = useMemo(
    () =>
      data.usage.map((b) => {
        const totals = b.results.reduce(
          (acc, r) => {
            acc.input += r.uncached_input_tokens;
            acc.output += r.output_tokens;
            acc.cache += r.cache_read_input_tokens;
            return acc;
          },
          { input: 0, output: 0, cache: 0 },
        );
        return { time: fmtDate(b.starting_at, data.range.bucket), ...totals };
      }),
    [data.usage, data.range.bucket],
  );

  return (
    <ChartCard title="טוקנים לאורך זמן" subtitle={`גרנולריות: ${labelForBucket(data.range.bucket)}`}>
      <div className="h-[200px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DFD3BB" />
            <XAxis dataKey="time" stroke="#4A5C44" fontSize={11} />
            <YAxis stroke="#4A5C44" fontSize={11} tickFormatter={fmtNum} />
            <Tooltip
              formatter={(v) => fmtNum(Number(v))}
              contentStyle={{ direction: 'ltr', background: '#FBF5EA', border: '1px solid #DFD3BB' }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
              iconSize={10}
            />
            <Line type="monotone" dataKey="input" name="קלט" stroke="#2A3B27" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="output" name="פלט" stroke="#7A6E4C" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="cache" name="Cache reads" stroke="#A8B89C" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

function ModelBreakdown({ data }: { data: MetricsResponse }) {
  const byModel = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of data.usage) {
      for (const r of b.results) {
        const k = r.model ?? 'unknown';
        map.set(
          k,
          (map.get(k) ?? 0) +
            r.uncached_input_tokens +
            r.output_tokens +
            r.cache_read_input_tokens,
        );
      }
    }
    return Array.from(map.entries())
      .map(([model, tokens]) => ({
        model,
        shortName: shortModelName(model),
        tokens,
      }))
      .sort((a, b) => b.tokens - a.tokens);
  }, [data.usage]);

  if (byModel.length === 0) return null;

  const palette = ['#2A3B27', '#4A5C44', '#7A6E4C', '#A8B89C', '#DFD3BB'];
  const total = byModel.reduce((acc, m) => acc + m.tokens, 0);

  // Single model: show as a stat row, not a chart (a chart of one bar is silly).
  if (byModel.length === 1) {
    const m = byModel[0];
    return (
      <ChartCard title="פירוט לפי מודל" subtitle="סה״כ טוקנים בטווח">
        <div className="flex items-center justify-between px-2 py-3">
          <div>
            <div className="text-sm font-medium text-forest-900">{m.shortName}</div>
            <div className="text-xs text-forest-700 mt-0.5">{m.model}</div>
          </div>
          <div className="text-2xl font-bold text-forest-800">{fmtNum(m.tokens)}</div>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="פירוט לפי מודל" subtitle="סה״כ טוקנים בטווח">
      <div className="space-y-2 px-1 py-1">
        {byModel.map((m, i) => {
          const pct = total === 0 ? 0 : (m.tokens / total) * 100;
          return (
            <div key={m.model} className="space-y-1">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-forest-900">{m.shortName}</span>
                <span className="text-forest-700">
                  {fmtNum(m.tokens)}
                  <span className="text-forest-700/60 mr-1">· {pct.toFixed(0)}%</span>
                </span>
              </div>
              <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: palette[i % palette.length],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

function shortModelName(model: string): string {
  return model.replace(/^claude-/, '').replace(/-\d{8}$/, '');
}

function CacheCard({ data }: { data: MetricsResponse }) {
  const stats = useMemo(() => {
    let read = 0;
    let create1h = 0;
    let create5m = 0;
    let uncached = 0;
    for (const b of data.usage) {
      for (const r of b.results) {
        read += r.cache_read_input_tokens;
        create1h += r.cache_creation?.ephemeral_1h_input_tokens ?? 0;
        create5m += r.cache_creation?.ephemeral_5m_input_tokens ?? 0;
        uncached += r.uncached_input_tokens;
      }
    }
    return { read, create1h, create5m, uncached };
  }, [data.usage]);

  return (
    <ChartCard title="קאש" subtitle="פירוט שימוש בקאש בטווח">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-2 py-1">
        <MiniStat label="Cache reads" value={fmtNum(stats.read)} />
        <MiniStat label="Cache create (5m)" value={fmtNum(stats.create5m)} />
        <MiniStat label="Cache create (1h)" value={fmtNum(stats.create1h)} />
        <MiniStat label="Uncached input" value={fmtNum(stats.uncached)} />
      </div>
    </ChartCard>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream-100 rounded-xl p-3">
      <div className="text-xs text-forest-700">{label}</div>
      <div className="text-lg font-bold text-forest-900">{value}</div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-forest-900">{title}</h2>
        {subtitle && <p className="text-xs text-forest-700">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

interface CreditReload {
  id: string;
  amountUsd: number;
  date: string;
  note?: string;
}

function CreditsManager({ onChange }: { onChange: () => void }) {
  const [reloads, setReloads] = useState<CreditReload[]>([]);
  const [totalUsd, setTotalUsd] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [note, setNote] = useState('');

  const fetchReloads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/credits', { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const json = (await res.json()) as { reloads: CreditReload[]; totalUsd: number };
      setReloads(json.reloads);
      setTotalUsd(json.totalUsd);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'שגיאה');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReloads();
  }, [fetchReloads]);

  async function handleAdd() {
    setAdding(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUsd: Number(amount),
          date: new Date(date).toISOString(),
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setAmount('');
      setNote('');
      setShowForm(false);
      await fetchReloads();
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'שגיאה');
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק את הטעינה הזו?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/credits?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      await fetchReloads();
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'שגיאה');
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-forest-900">
            ניהול קרדיטים
          </h2>
          <p className="text-xs text-forest-700">
            סך טעינות: {fmtUsd(totalUsd)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-forest-800 text-cream-50 hover:bg-forest-900 transition"
        >
          {showForm ? 'ביטול' : '+ הוסף טעינה'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 rounded-xl p-2 text-xs mb-3">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-cream-50 rounded-xl p-3 mb-3 space-y-2 border border-sage-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <label className="text-xs text-forest-700">
              <span className="block mb-1">סכום (USD)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 rounded-lg border border-sage-300 bg-white text-forest-900 text-sm"
              />
            </label>
            <label className="text-xs text-forest-700">
              <span className="block mb-1">תאריך</span>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-sage-300 bg-white text-forest-900 text-sm"
              />
            </label>
            <label className="text-xs text-forest-700">
              <span className="block mb-1">הערה (אופציונלי)</span>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="למשל: כרטיס אישי"
                className="w-full px-3 py-2 rounded-lg border border-sage-300 bg-white text-forest-900 text-sm"
              />
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAdd}
              disabled={adding || !amount || Number(amount) <= 0}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-forest-800 text-cream-50 hover:bg-forest-900 disabled:bg-sage-300 disabled:cursor-not-allowed transition"
            >
              {adding ? 'שומר...' : 'שמור'}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-forest-700 text-sm py-3 text-center">טוען...</div>
      )}

      {!loading && reloads.length === 0 && (
        <div className="text-forest-700 text-sm py-3 text-center">
          אין טעינות עדיין. הוסף את הטעינה הראשונה.
        </div>
      )}

      {!loading && reloads.length > 0 && (
        <div className="divide-y divide-cream-100">
          {[...reloads]
            .sort((a, b) => (a.date < b.date ? 1 : -1))
            .map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-2 gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-forest-900">
                    {fmtUsd(r.amountUsd)}
                    <span className="text-xs text-forest-700 mr-2">
                      {fmtReloadDate(r.date)}
                    </span>
                  </div>
                  {r.note && (
                    <div className="text-[11px] text-forest-700/80 truncate">
                      {r.note}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  className="text-xs text-red-700 hover:text-red-900 px-2 py-1 shrink-0"
                >
                  מחק
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function fmtReloadDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function computeRange(
  preset: RangePreset,
  customFrom: string,
  customTo: string,
): { from: string; to: string; bucket: Bucket } | null {
  const now = new Date();
  if (preset === '24h') {
    return {
      from: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      to: now.toISOString(),
      bucket: '1h',
    };
  }
  if (preset === '7d') {
    return {
      from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      to: now.toISOString(),
      bucket: '1d',
    };
  }
  if (preset === '30d') {
    return {
      from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      to: now.toISOString(),
      bucket: '1d',
    };
  }
  if (preset === 'custom') {
    if (!customFrom || !customTo) return null;
    const from = new Date(customFrom);
    const to = new Date(customTo);
    if (isNaN(from.getTime()) || isNaN(to.getTime()) || from >= to) return null;
    const hours = (to.getTime() - from.getTime()) / (60 * 60 * 1000);
    const bucket: Bucket = hours <= 24 ? '1h' : '1d';
    return { from: from.toISOString(), to: to.toISOString(), bucket };
  }
  return null;
}

function fmtUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtDate(iso: string, bucket: Bucket): string {
  const d = new Date(iso);
  if (bucket === '1d') {
    return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' });
  }
  return d.toLocaleString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function labelForBucket(b: Bucket): string {
  if (b === '1m') return 'לפי דקה';
  if (b === '1h') return 'לפי שעה';
  return 'לפי יום';
}
