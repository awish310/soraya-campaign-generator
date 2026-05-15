import type { ReactNode } from 'react';

export function Card({
  children,
  accent = false,
}: {
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl p-5 shadow-sm border ${
        accent
          ? 'bg-cream-50 border-cream-200'
          : 'bg-white border-cream-100'
      }`}
    >
      {children}
    </section>
  );
}

export function Label({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-bold text-forest-800">{children}</h2>
      {hint && <p className="text-xs text-sage-600 mt-0.5">{hint}</p>}
    </div>
  );
}
