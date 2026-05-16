import { BRAND_LINKS } from '@/lib/brand-links';
import { LogoTapGate } from './LogoTapGate';

export function Header() {
  return (
    <header className="bg-gradient-to-b from-forest-900 via-forest-800 to-forest-700 text-cream-100 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
        <svg className="absolute -top-12 -left-12 w-56 h-56" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" stroke="#DFD3BB" strokeWidth="0.8" />
          <circle cx="100" cy="100" r="55" stroke="#DFD3BB" strokeWidth="0.8" />
        </svg>
      </div>
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-7 sm:py-10 relative">
        <HeaderLinks />
        <div className="flex items-center gap-4 mb-3">
          <LogoTapGate />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-cream-50 leading-tight">
              מילים לנשום
            </h1>
            <p className="text-cream-200 text-sm sm:text-base mt-0.5">
              כלי השגרירים של מרכז סוראיה
            </p>
          </div>
        </div>
        <p className="text-cream-300 text-xs sm:text-sm font-medium">
          עכשיו זה הזמן שלנו לתת להם לנשום.
        </p>
      </div>
    </header>
  );
}

function HeaderLinks() {
  return (
    <nav
      aria-label="קישורים מהירים"
      className="absolute top-3 left-3 sm:top-4 sm:left-5 flex gap-1 sm:gap-1.5 z-10"
    >
      {BRAND_LINKS.map(({ href, label, icon: Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={label}
          title={label}
          className="p-2 rounded-lg bg-cream-50/10 hover:bg-cream-50/20 text-cream-100 hover:text-cream-50 transition backdrop-blur-sm"
        >
          <Icon size={16} aria-hidden />
        </a>
      ))}
    </nav>
  );
}
