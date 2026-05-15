import { ExternalLink } from 'lucide-react';
import { BRAND_LINKS } from '@/lib/brand-links';

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-cream-100 to-cream-200 mt-10 py-10 border-t border-cream-300">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 text-center">
        <h3 className="font-bold text-forest-800 mb-2">קישורים מהירים</h3>
        <p className="text-sage-700 text-sm mb-5 max-w-md mx-auto">
          רשתות חברתיות, קבוצת השגרירים וחומרי מדיה לשימוש שלך.
        </p>
        <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
          {BRAND_LINKS.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-cream-200 hover:border-forest-300 hover:bg-cream-50 text-forest-800 text-sm font-semibold shadow-sm transition"
            >
              <Icon size={16} className="text-sage-600" aria-hidden />
              <span>{label}</span>
            </a>
          ))}
        </div>
        <p className="mt-7 text-xs text-sage-700">
          מרכז סוראיה ·{' '}
          <a
            className="inline-flex items-center gap-1 hover:text-forest-800 underline-offset-2 hover:underline"
            href="https://soraya.center"
            target="_blank"
            rel="noreferrer"
          >
            soraya.center
            <ExternalLink size={11} aria-hidden />
          </a>
        </p>
      </div>
    </footer>
  );
}
