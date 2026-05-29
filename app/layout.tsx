import type { Metadata, Viewport } from 'next';
import { Rubik } from 'next/font/google';
import './globals.css';

const rubik = Rubik({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-rubik',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'בתחזוקה · מרכז סוראיה',
  description: 'הכלי של מרכז סוראיה נמצא בתחזוקה מתוכננת. אנחנו כבר חוזרים.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#2A3B27',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={rubik.variable}>
      <body>{children}</body>
    </html>
  );
}
