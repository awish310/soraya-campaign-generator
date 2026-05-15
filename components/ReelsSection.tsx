'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ExternalLink,
  Clapperboard,
  TrendingUp,
  Facebook,
  Instagram,
  ListChecks,
} from 'lucide-react';
import {
  REELS,
  reelEmbedUrl,
  fetchReels,
  type Reel,
  type ReelSource,
} from '@/lib/reels';
import { Card, Label } from './ui';

interface Props {
  source: ReelSource;
}

const SOURCE_LABEL: Record<ReelSource, string> = {
  facebook: 'פייסבוק',
  instagram: 'אינסטגרם',
};

const SOURCE_ICON: Record<ReelSource, typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
};

const STEPS_BY_SOURCE: Record<ReelSource, string[]> = {
  facebook: [
    'ודאו שיש לכם מסר מוכן - יצרתם אותו בטופס למעלה.',
    'לחצו ״פתח בפייסבוק״ על ריל שמתאים לכם.',
    'בפייסבוק - לחצו על כפתור השיתוף של הריל ובחרו Share Now או Share to Feed.',
    'הדביקו את הטקסט שיצרתם כתיאור השיתוף ולחצו פרסם.',
  ],
  instagram: [
    'ודאו שיש לכם מסר מוכן - יצרתם אותו בטופס למעלה.',
    'לחצו ״פתח באינסטגרם״ על ריל שמתאים לכם.',
    'באפליקציה - לחצו על אייקון השיתוף (מטוס נייר) של הריל.',
    'שתפו לסטורי עם סטיקר Link והקישור האישי, או שלחו ב-DM עם הטקסט.',
  ],
};

export function ReelsSection({ source }: Props) {
  const [reels, setReels] = useState<Reel[]>(REELS);

  useEffect(() => {
    let cancelled = false;
    fetchReels().then((remote) => {
      if (!cancelled && remote) setReels(remote);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => reels.filter((r) => r.source === source),
    [reels, source],
  );

  if (filtered.length === 0) return null;

  const SourceIcon = SOURCE_ICON[source];
  const sourceLabel = SOURCE_LABEL[source];

  return (
    <Card>
      <Label
        hint={`את הטקסט יוצרים כאן בטופס - את הריל משתפים ישירות מ${sourceLabel}.`}
      >
        <span className="inline-flex items-center gap-2 flex-wrap">
          <Clapperboard size={18} className="text-sage-600" aria-hidden />
          שתפו ריל של המרכז
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sage-100 text-sage-800 text-[11px] font-normal">
            <SourceIcon size={11} aria-hidden />
            {sourceLabel}
          </span>
        </span>
      </Label>

      <div className="mb-3 bg-sage-50/60 border border-sage-200 rounded-xl p-3 flex items-start gap-2.5">
        <TrendingUp
          size={18}
          className="shrink-0 mt-0.5 text-sage-700"
          aria-hidden
        />
        <p className="text-sm text-forest-900 leading-relaxed">
          <strong>למה זה חשוב?</strong> שיתוף ריל של המרכז עם המסר שלכם = חשיפה
          כפולה. רילים מקבלים חשיפה אורגנית גבוהה יותר מפוסטים רגילים, ומגיעים
          גם לאנשים שלא עוקבים אחריכם. הצירוף של ריל + טקסט אישי הוא הכי
          אפקטיבי.
        </p>
      </div>

      <div className="mb-3 bg-cream-50 border border-cream-200 rounded-xl p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-2">
          <ListChecks size={16} className="text-forest-800" aria-hidden />
          <h4 className="text-sm font-bold text-forest-900">איך עושים את זה?</h4>
        </div>
        <ol className="space-y-2 text-sm text-forest-900">
          {STEPS_BY_SOURCE[source].map((step, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="shrink-0 w-5 h-5 rounded-full bg-forest-800 text-cream-50 text-[11px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div
        id="reels-grid"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 scroll-mt-6"
      >
        {filtered.map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </div>
    </Card>
  );
}

function ReelCard({ reel }: { reel: Reel }) {
  const sourceLabel = SOURCE_LABEL[reel.source];
  return (
    <div className="bg-cream-50 border border-cream-200 rounded-xl overflow-hidden flex flex-col">
      <div className="relative aspect-[9/16] bg-forest-900 max-h-[260px]">
        <iframe
          title={reel.title ?? `ריל ${reel.id}`}
          src={reelEmbedUrl(reel)}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <div className="p-1.5">
        <a
          href={reel.url}
          target="_blank"
          rel="noreferrer noopener"
          className="w-full px-2 py-2 rounded-lg bg-forest-800 hover:bg-forest-900 active:bg-forest-900 text-cream-50 text-xs font-semibold flex items-center justify-center gap-1 transition"
        >
          <ExternalLink size={13} aria-hidden />
          <span>פתח ב{sourceLabel}</span>
        </a>
      </div>
    </div>
  );
}
