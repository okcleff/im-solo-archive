import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SEASONS_DATA, LATEST_SEASON, getLatestAirDate } from '@/entities/participant';
import { getSiteUrl, SITE_NAME } from '@/shared/config/site';
import JsonLd from '@/shared/ui/JsonLd';
import { ClientHome } from '@/widgets/home-interactive';

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: `나는 SOLO 출연자 아카이브 | 전 기수 프로필 총정리`,
  description:
    `나는 SOLO 전 기수 출연자 직업, 나이, 지역, 특징을 한눈에 검색하세요. 현재 ${LATEST_SEASON.seasonNo}기(${LATEST_SEASON.label}) 방영 중.`,
  alternates: { canonical: BASE },
  openGraph: {
    title: `나는 SOLO 출연자 아카이브 | ${LATEST_SEASON.seasonNo}기 포함 전 기수`,
    description: '나는 SOLO 전 기수 출연자 프로필을 검색하고 비교하세요.',
    url: BASE,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: `${SITE_NAME} 기수 목록`,
  description: '나는 SOLO 전 기수 출연자 아카이브',
  url: BASE,
  itemListElement: SEASONS_DATA.map((s, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: s.label,
    url: `${BASE}/season/${s.seasonNo}`,
  })),
};

export default function HomePage() {
  const latestAirDate = getLatestAirDate(SEASONS_DATA);
  const totalParticipants = SEASONS_DATA.reduce((acc, s) => acc + s.participants.length, 0);

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-rose-400 text-sm font-medium mb-3">
            <span>♥</span>
            <span>비공식 팬 아카이브</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">나는 SOLO 출연자 아카이브</h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl">
            전 기수 출연자 직업, 나이, 지역, 특징을 검색하고 한눈에 비교하세요.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full">
              최신 방영: {latestAirDate} ({LATEST_SEASON.label})
            </span>
            <span className="bg-slate-700/50 text-slate-300 border border-slate-600/30 px-3 py-1 rounded-full">
              {SEASONS_DATA.length}개 기수 · 총 {totalParticipants}명
            </span>
          </div>
        </div>
      </section>

      {/* 인터랙티브 필터 + 그리드 */}
      <div className="max-w-6xl mx-auto">
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-16 text-slate-400">
              <svg className="animate-spin h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              로딩 중…
            </div>
          }
        >
          <ClientHome seasons={SEASONS_DATA} />
        </Suspense>
      </div>

      {/* 기수별 바로가기 (SEO 정적 콘텐츠) */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold text-slate-700 mb-4 pt-8 border-t border-slate-200">
          기수별 바로가기
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SEASONS_DATA.map((s, i) => (
            <a
              key={s.seasonNo}
              href={`/season/${s.seasonNo}`}
              className="block bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:border-rose-300
                hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="text-rose-500 font-bold text-lg group-hover:text-rose-600">
                  {s.seasonNo}기
                </div>
                {/* 최신 기수 배지 */}
                {i === 0 && (
                  <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                    최신
                  </span>
                )}
              </div>
              <div className="text-slate-500 text-xs mt-1 line-clamp-2">{s.label}</div>
              <div className="text-slate-400 text-xs mt-2">
                출연자 {s.participants.length}명 · EP
                {s.episodes[0].ep}
                {s.episodes.length > 1 ? `~${s.episodes.at(-1)!.ep}` : ''}
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
