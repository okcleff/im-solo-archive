import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { SEASONS_DATA, SHOW_INFO } from '@/entities/participant';
import { SeasonNav } from '@/widgets/season-nav';
import { getSiteUrl, SITE_NAME } from '@/shared/config/site';

const BASE = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: `${SITE_NAME} | 나는 SOLO 전 기수 출연자 프로필`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    '나는 SOLO(나는솔로) 전 기수 출연자 직업, 나이, 지역, 특징, 이슈를 한눈에 검색하세요.',
  keywords: ['나는솔로', '나는SOLO', '솔로나라', '출연자', '프로필'],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'ko_KR',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
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
              <span className="hidden sm:inline">{SITE_NAME}</span>
              <span className="sm:hidden">나는 SOLO</span>
            </Link>

            {/* 확장형 기수 드롭다운 */}
            <SeasonNav seasons={SEASONS_DATA} />
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-400">
          <p>
            본 사이트는 공개된 뉴스 기사 기반의 비공식 아카이브입니다.{' '}
            <a
              href={SHOW_INFO.officialVod}
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
