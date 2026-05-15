'use client';

import { useEffect, useRef } from 'react';
import { Mic, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      <div
        className="absolute inset-0 bg-forest-900/75 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-forest-900/10 animate-rise-in max-h-[92vh] overflow-y-auto">
        <div className="bg-gradient-to-b from-forest-900 via-forest-800 to-forest-700 text-cream-50 px-6 py-7 sm:px-8 sm:py-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
            <svg className="absolute -top-10 -left-10 w-48 h-48" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="80" stroke="#DFD3BB" strokeWidth="0.8" />
              <circle cx="100" cy="100" r="55" stroke="#DFD3BB" strokeWidth="0.8" />
            </svg>
          </div>
          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-cream-50/15 ring-2 ring-cream-50/30 mb-3">
              <Mic size={34} className="text-cream-50" aria-hidden />
            </div>
            <h2
              id="onboarding-title"
              className="text-xl sm:text-2xl font-bold leading-tight"
            >
              שגרירים, זכרו: הלב עובר בקול! 🎙️
            </h2>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8 sm:py-7 space-y-4">
          <p className="text-forest-900 leading-relaxed text-[15px]">
            טקסט זה התחלה טובה - אבל מה שבאמת מניע אנשים לתרום זה{' '}
            <strong className="text-forest-800">
              שיחות טלפון והודעות קוליות אישיות
            </strong>
            . אנשים תורמים לאנשים שהם סומכים עליהם, לא להודעה כללית.
          </p>
          <p className="text-sage-700 text-sm leading-relaxed">
            הקול שלך הוא הנכס הכי חזק שלך. כשמישהו שומע אותך - הוא שומע שאת/ה
            באמת מאמין/ה בזה. זה מה שגורם לאנשים להתחבר לסיפור ולתרום.
          </p>

          <div className="bg-terracotta-50 border-2 border-terracotta-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-sm">
            <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-terracotta-500 to-terracotta-600 text-white flex items-center justify-center font-extrabold text-base shadow-md">
              2:1
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-terracotta-900 mb-1 text-base">
                כלל ה-2:1
              </h3>
              <p className="text-sm text-terracotta-900 leading-relaxed">
                לכל מסר טקסטואלי שאת/ה מייצר/ת כאן - שלח/י לפחות{' '}
                <strong>שתי הודעות קוליות אישיות</strong>. ככה התרומות באמת
                זזות.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 sm:px-8 sm:pb-7">
          <button
            ref={ctaRef}
            type="button"
            onClick={onClose}
            className="w-full px-5 py-4 rounded-2xl bg-gradient-to-l from-forest-800 to-forest-700 hover:from-forest-900 hover:to-forest-800 active:from-forest-900 active:to-forest-900 text-cream-50 font-bold text-base shadow-lg transition flex items-center justify-center gap-2"
          >
            <Sparkles size={18} aria-hidden />
            <span>הבנתי, בואו נתחיל</span>
          </button>
        </div>
      </div>
    </div>
  );
}
