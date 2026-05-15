import {
  Copy,
  Loader2,
  Send,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { Card, Label } from './ui';

export interface ResultCardProps {
  loading: boolean;
  error: string;
  generated: string;
  isWhatsApp: boolean;
  onGenerate: () => void;
  onCopy: () => void;
  onWhatsApp: () => void;
}

export function ResultCard({
  loading,
  error,
  generated,
  isWhatsApp,
  onGenerate,
  onCopy,
  onWhatsApp,
}: ResultCardProps) {
  return (
    <>
      <button
        type="button"
        onClick={onGenerate}
        disabled={loading}
        className="w-full px-5 py-4 rounded-2xl bg-gradient-to-l from-forest-800 to-forest-700 hover:from-forest-900 hover:to-forest-800 active:from-forest-900 active:to-forest-900 disabled:from-sage-300 disabled:to-sage-300 disabled:cursor-not-allowed text-cream-50 font-bold text-base shadow-md transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>מחולל מסר אישי...</span>
          </>
        ) : (
          <>
            <Sparkles size={20} />
            <span>ג&apos;נרט הודעה אישית</span>
          </>
        )}
      </button>

      {error && (
        <div className="bg-terracotta-50 border-r-4 border-terracotta-500 rounded-xl p-4 text-terracotta-900 shadow-sm">
          <div className="flex gap-3 items-start">
            <TriangleAlert size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {(generated || loading) && (
        <Card>
          <Label hint="ניתן לערוך לפני שליחה. כל מסר נוצר מחדש - ניתן לג׳נרט שוב לקבלת ניסוח אחר.">
            המסר שלך
          </Label>
          <div className="bg-gradient-to-b from-cream-50 to-white border border-cream-200 rounded-xl p-4 text-forest-900 whitespace-pre-wrap leading-relaxed min-h-[220px] text-[15px]">
            {loading ? (
              <div className="flex items-center gap-2 text-sage-500 h-full">
                <span className="dot-1 w-2 h-2 bg-forest-700 rounded-full" />
                <span className="dot-2 w-2 h-2 bg-forest-700 rounded-full" />
                <span className="dot-3 w-2 h-2 bg-forest-700 rounded-full" />
              </div>
            ) : (
              generated
            )}
          </div>
          {!loading && generated && (
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button
                type="button"
                onClick={onCopy}
                className="flex-1 px-4 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 active:bg-forest-900 text-cream-50 font-semibold shadow-sm transition flex items-center justify-center gap-2"
              >
                <Copy size={18} />
                <span>העתקת הטקסט</span>
              </button>
              {isWhatsApp && (
                <button
                  type="button"
                  onClick={onWhatsApp}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe57] active:bg-[#1aa64c] text-white font-semibold shadow-sm transition flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  <span>שיתוף ישיר בוואטסאפ</span>
                </button>
              )}
              <button
                type="button"
                onClick={onGenerate}
                className="px-4 py-3 rounded-xl bg-cream-100 hover:bg-cream-200 text-forest-800 font-semibold shadow-sm transition flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                <span>נסח שוב</span>
              </button>
            </div>
          )}
        </Card>
      )}
    </>
  );
}
