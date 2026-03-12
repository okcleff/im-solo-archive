import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SEASONS_DATA, SHOW_INFO } from "@/entities/participant/server";
import { SeasonNav } from "@/widgets/season-nav";
import { getSiteUrl, SITE_NAME } from "@/shared/config/site";
import ThemeProvider from "@/shared/ui/ThemeProvider";
import ThemeToggle from "@/shared/ui/ThemeToggle";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  title: {
    default: `${SITE_NAME} | 나는 SOLO 전 기수 출연자 프로필`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "나는 SOLO(나는솔로) 전 기수 출연자 직업, 나이, 지역, 특징, 이슈를 한눈에 검색하세요.",
  keywords: ["나는솔로", "나는SOLO", "솔로나라", "출연자", "프로필"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.setAttribute("data-theme",localStorage.getItem("theme"))}catch(e){}`,
          }}
        />
      </head>
      <body className="app-shell font-[var(--font-sans)]">
        <ThemeProvider>
          <header className="sticky top-0 z-40 border-b border-base-300/70 bg-base-100/85 backdrop-blur-xl">
            <div className="navbar max-w-6xl mx-auto min-h-16 px-4">
              <div className="navbar-start">
                <Link
                  href="/"
                  className="btn btn-ghost h-auto min-h-0 px-2 normal-case hover:bg-base-200"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-content text-xs font-black shadow-lg">
                    SOLO
                  </span>
                  <span className="text-left">
                    <strong className="block text-sm sm:text-base tracking-tight font-[var(--font-title)]">
                      {SITE_NAME}
                    </strong>
                    <span className="text-[11px] text-base-content/60">
                      Fan-curated participant archive
                    </span>
                  </span>
                </Link>
              </div>

              <div className="navbar-end gap-2">
                <ThemeToggle />
                <SeasonNav seasons={SEASONS_DATA} />
              </div>
            </div>
          </header>

          <main>{children}</main>

          <footer className="mt-16 border-t border-base-300/70 bg-base-100/85">
            <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-base-content/70">
              <p>
                본 사이트는 공개된 뉴스 기사 기반의 비공식 아카이브입니다.{" "}
                <a
                  href={SHOW_INFO.officialVod}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="나는 SOLO 공식 VOD (새 탭에서 열림)"
                  className="link link-primary font-medium"
                >
                  나는 SOLO 공식 VOD
                </a>
              </p>
              <p className="mt-1.5">
                문의:{" "}
                <a
                  href="mailto:imsoloarchive@gmail.com"
                  className="link link-primary font-medium"
                >
                  imsoloarchive@gmail.com
                </a>
              </p>
              <p className="mt-1.5">
                GitHub:{" "}
                <a
                  href="https://github.com/okcleff/im-solo-archive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary font-medium"
                >
                  github.com/okcleff/im-solo-archive
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
