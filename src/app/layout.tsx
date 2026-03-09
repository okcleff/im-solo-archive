import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { SEASONS_DATA, SHOW_INFO } from '@/entities/participant/lib/data';
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(s!=='light'&&d)){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="font-[var(--font-sans)] text-[color:var(--fg)] transition-colors duration-200">
        <ThemeProvider>
          <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-[color:var(--surface)] backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] rounded-xl px-1 py-1">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-rose-500 text-white text-xs font-bold grid place-items-center shadow-lg shadow-blue-500/30">
                  SOLO
                </span>
                <span>
                  <strong className="block text-sm sm:text-base tracking-tight font-[var(--font-title)]">{SITE_NAME}</strong>
                  <span className="text-[11px] text-muted">Fan-curated participant archive</span>
                </span>
              </Link>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <SeasonNav seasons={SEASONS_DATA} />
              </div>
            </div>
          </header>

          <main>{children}</main>

          <footer className="mt-16 border-t border-[color:var(--line)] bg-[color:var(--surface)] backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-muted">
              <p>
                본 사이트는 공개된 뉴스 기사 기반의 비공식 아카이브입니다.{' '}
                <a
                  href={SHOW_INFO.officialVod}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="나는 SOLO 공식 VOD (새 탭에서 열림)"
                  className="text-[color:var(--accent)] underline underline-offset-2 hover:no-underline"
                >
                  나는 SOLO 공식 VOD
                </a>
              </p>
              <p className="mt-1.5 text-xs">데이터 최종 업데이트: 2026-03-04</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
