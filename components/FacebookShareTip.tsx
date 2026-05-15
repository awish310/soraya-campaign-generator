'use client';

import { ArrowUp, Rocket } from 'lucide-react';

interface FacebookShareTipProps {
  onScrollToReels: () => void;
}

export function FacebookShareTip({ onScrollToReels }: FacebookShareTipProps) {
  return (
    <div className="bg-gradient-to-bl from-sage-50 to-cream-50 border-2 border-sage-300 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-forest-800 text-cream-50 flex items-center justify-center shadow-sm">
          <Rocket size={20} aria-hidden />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-forest-900 text-base mb-1">
            המסר מוכן! עכשיו הזמן לשתף.
          </h3>
          <p className="text-sm text-sage-800 leading-relaxed">
            העתיקו את המסר ועלו לקטע הרילים למעלה - שם תמצאו את ההוראות המלאות
            ואת כפתורי הפתיחה ל{`פייסבוק`}. הריל + הטקסט שלכם = החשיפה הכי
            גדולה.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onScrollToReels}
        className="w-full px-4 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 active:bg-forest-900 text-cream-50 font-semibold shadow-sm transition flex items-center justify-center gap-2"
      >
        <ArrowUp size={18} aria-hidden />
        <span>עלה לרילים</span>
      </button>
    </div>
  );
}
