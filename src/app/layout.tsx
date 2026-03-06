import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { SEASONS_DATA, SHOW_INFO } from '@/entities/participant';
import { SeasonNav } from '@/widgets/season-nav';
import { getSiteUrl, SITE_NAME } from '@/shared/config/site';
import ThemeProvider from '@/shared/ui/ThemeProvider';
import ThemeToggle from '@/shared/ui/ThemeToggle';

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
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 다크 모드 플래시 방지: 렌더링 전 즉시 실행 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(s!=='light'&&d)){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="bg-[#F5F4F0] dark:bg-slate-950 text-[#111] dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
          <header className="bg-[#0F0F0F] text-white border-b border-white/[0.06] sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
              <Link
                href="/"
                className="font-bold text-lg tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-rose-400">♥</span>
                <span className="hidden sm:inline">{SITE_NAME}</span>
                <span className="sm:hidden">나는 SOLO</span>
              </Link>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <SeasonNav seasons={SEASONS_DATA} />
              </div>
            </div>
          </header>

          <main>{children}</main>

          <footer className="mt-16 border-t border-[#E8E7E3] dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>
              본 사이트는 공개된 뉴스 기사 기반의 비공식 아카이브입니다.{' '}
              <a
                href={SHOW_INFO.officialVod}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="나는 SOLO 공식 VOD (새 탭에서 열림)"
                className="text-rose-600 dark:text-rose-400 underline hover:no-underline"
              >
                나는 SOLO 공식 VOD
              </a>
            </p>
            <p className="mt-1">데이터 최종 업데이트: 2026-03-04</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
