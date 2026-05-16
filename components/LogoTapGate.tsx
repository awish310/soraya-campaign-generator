'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

const REQUIRED_TAPS = 5;
const WINDOW_MS = 5000;

export function LogoTapGate() {
  const router = useRouter();
  const tapTimes = useRef<number[]>([]);

  function handleTap() {
    const now = Date.now();
    tapTimes.current = [...tapTimes.current, now].filter(
      (t) => now - t <= WINDOW_MS,
    );
    if (tapTimes.current.length >= REQUIRED_TAPS) {
      tapTimes.current = [];
      router.push('/admin/usage');
    }
  }

  return (
    <button
      type="button"
      onClick={handleTap}
      aria-label="מרכז סוראיה"
      className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-cream-50/40"
    >
      <Image
        src="/soraya-logo.png"
        alt="מרכז סוראיה"
        width={76}
        height={76}
        priority
        className="rounded-full shadow-md w-[64px] h-[64px] sm:w-[76px] sm:h-[76px]"
      />
    </button>
  );
}
