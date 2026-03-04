import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { getSiteUrl } from '@/lib/utils';

const BASE = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: '나는 SOLO 출연자 아카이브 | 28기·29기·30기 프로필',
    template: '%s | 나는 SOLO 아카이브',
  },
  description:
    '나는 SOLO(나는솔로) 28기·29기·30기 출연자 직업, 나이, 지역, 특징, 이슈를 한눈에 검색하세요.',
  keywords: ['나는솔로', '나는SOLO', '솔로나라', '출연자', '프로필', '28기', '29기', '30기'],
  openGraph: {
    type: 'website',
    siteName: '나는 SOLO 아카이브',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="font-bold text-lg tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-rose-400">♥</span>
              <span>나는 SOLO 아카이브</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-slate-300">
              <Link href="/season/30" className="hover:text-white transition-colors">
                30기
              </Link>
              <Link href="/season/29" className="hover:text-white transition-colors">
                29기
              </Link>
              <Link href="/season/28" className="hover:text-white transition-colors">
                28기
              </Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-400">
          <p>
            본 사이트는 공개된 뉴스 기사 기반의 비공식 아카이브입니다.{' '}
            <a
              href="https://programs.sbs.co.kr/plus/iamsolo/vods/69610"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-400 hover:underline"
            >
              나는 SOLO 공식 VOD
            </a>
          </p>
          <p className="mt-1">데이터 최종 업데이트: 2026-03-04</p>
        </footer>
      </body>
    </html>
  );
}
