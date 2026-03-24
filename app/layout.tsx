import type { Metadata } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { KOREAN_SERVICE_NAME } from '@/lib/year';
import './globals.css';

const notoSerifKr = localFont({
  src: [
    {
      path: '../public/fonts/NotoSerifKR[wght].ttf',
      weight: '200 900',
      style: 'normal'
    }
  ],
  variable: '--font-noto-serif-kr',
  display: 'swap',
  preload: true,
  fallback: ['Noto Serif', 'Source Han Serif KR', 'serif']
});

export const metadata: Metadata = {
  metadataBase: new URL('https://backthen.example'),
  title: {
    default: `${KOREAN_SERVICE_NAME} | BackThen`,
    template: '%s | BackThen'
  },
  description: '서울 기준 오늘을 바탕으로 몇 년 전의 신문 1면을 다시 펼쳐보는 단일 페이지 아카이브.',
  applicationName: KOREAN_SERVICE_NAME,
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/apple-icon.svg'
  },
  openGraph: {
    title: `${KOREAN_SERVICE_NAME} | BackThen`,
    description: '서울 기준 오늘을 바탕으로 몇 년 전의 신문 1면을 다시 펼쳐보는 단일 페이지 아카이브.',
    siteName: 'BackThen',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: `${KOREAN_SERVICE_NAME} | BackThen`,
    description: '서울 기준 오늘을 바탕으로 몇 년 전의 신문 1면을 다시 펼쳐보는 단일 페이지 아카이브.'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSerifKr.className} ${notoSerifKr.variable}`}>{children}</body>
    </html>
  );
}
