'use client';

import { useEffect, useRef } from 'react';
import { Eye, Copy, Send, ShieldCheck } from 'lucide-react';

export type CopyReviewAction = 'copy' | 'whatsapp';

interface CopyReviewModalProps {
  open: boolean;
  action: CopyReviewAction;
  onConfirm: () => void;
  onClose: () => void;
}

const ACTION_CONFIG: Record<
  CopyReviewAction,
  { ctaLabel: string; CtaIcon: typeof Copy }
> = {
  copy: { ctaLabel: 'בדקתי, העתק לי', CtaIcon: Copy },
  whatsapp: { ctaLabel: 'בדקתי, פתח וואטסאפ', CtaIcon: Send },
};

export function CopyReviewModal({
  open,
  action,
  onConfirm,
  onClose,
}: CopyReviewModalProps) {
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      ctaRef.current?.focus();
    }, 60);

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const { ctaLabel, CtaIcon } = ACTION_CONFIG[action];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="copy-review-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      <div
        className="absolute inset-0 bg-forest-900/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-forest-900/10 animate-rise-in max-h-[92vh] overflow-y-auto">
        <div className="bg-gradient-to-b from-sage-700 to-sage-600 text-cream-50 px-5 py-5 sm:px-7 sm:py-6 text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-cream-50/15 ring-2 ring-cream-50/30 mb-2">
            <Eye size={28} className="text-cream-50" aria-hidden />
          </div>
          <h2
            id="copy-review-title"
            className="text-lg sm:text-xl font-bold leading-tight"
          >
            רגע לפני שליחה - בדקו את המסר
          </h2>
          <p className="text-cream-100 text-sm mt-1">
            המסר נוצר באמצעות AI ויכול להכיל טעויות.
          </p>
        </div>

        <div className="px-5 py-5 sm:px-7 sm:py-6 space-y-3">
          <p className="text-forest-900 text-sm leading-relaxed">
            <strong>לפני שאתם ממשיכים</strong>, ודאו ש:
          </p>

          <ul className="space-y-1.5 text-sm text-forest-900 pr-1">
            <li className="flex gap-2">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-sage-600 mt-1.5" />
              <span>אין שגיאות לשון או דקדוק.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-sage-600 mt-1.5" />
              <span>הקישור לתרומה והקישור לפייסבוק נכונים.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-sage-600 mt-1.5" />
              <span>הניסוח מרגיש לכם אישי ואותנטי.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-sage-600 mt-1.5" />
              <span>פרטים על הנמען (שם, סמול-טוק) נכונים ומדויקים.</span>
            </li>
          </ul>

          <div className="bg-sage-50 border border-sage-200 rounded-xl p-3 flex items-start gap-2.5">
            <ShieldCheck
              size={16}
              className="shrink-0 mt-0.5 text-sage-700"
              aria-hidden
            />
            <p className="text-sm text-forest-900 leading-relaxed">
              כשהמסר ברור ומרגיש לכם נכון - לחצו על הכפתור למטה כדי להמשיך.
            </p>
          </div>
        </div>

        <div className="px-5 pb-5 sm:px-7 sm:pb-6 flex flex-col gap-2">
          <button
            ref={ctaRef}
            type="button"
            onClick={onConfirm}
            className="w-full px-5 py-3.5 rounded-2xl bg-gradient-to-l from-forest-800 to-forest-700 hover:from-forest-900 hover:to-forest-800 active:from-forest-900 active:to-forest-900 text-cream-50 font-bold text-base shadow-md transition flex items-center justify-center gap-2"
          >
            <CtaIcon size={18} aria-hidden />
            <span>{ctaLabel}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full px-5 py-2.5 rounded-xl text-sage-700 hover:text-forest-800 hover:bg-cream-100 text-sm font-medium transition"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
