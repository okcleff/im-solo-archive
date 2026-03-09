import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SEASONS_DATA, LATEST_SEASON } from '@/entities/participant/lib/data';
import { getLatestAirDate } from '@/entities/participant';
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

      <section className="px-4 pt-10 pb-6 sm:pt-14">
        <div className="max-w-6xl mx-auto rounded-[28px] surface p-6 sm:p-10 overflow-hidden relative">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-rose-500/20 blur-3xl rounded-full" aria-hidden="true" />

          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[color:var(--accent)] mb-4">
            비공식 팬 아카이브
          </p>
          <h1 className="font-[var(--font-title)] text-4xl sm:text-6xl leading-[1.05] tracking-tight max-w-3xl">
            나는 SOLO 출연자 데이터를
            <br className="hidden sm:block" />
            더 빠르게 탐색하세요
          </h1>
          <p className="mt-5 text-muted text-base sm:text-lg max-w-2xl leading-relaxed">
            전 기수 출연자의 직업, 나이, 지역, 화제 포인트를 시즌 단위로 탐색하고 비교할 수 있습니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <span className="chip text-xs px-3 py-1.5 rounded-full">
              최신 방영: {latestAirDate} ({LATEST_SEASON.label})
            </span>
            <span className="chip text-xs px-3 py-1.5 rounded-full">
              {SEASONS_DATA.length}개 기수 · 총 {totalParticipants}명
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto">
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-20 text-muted">
              <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              로딩 중...
            </div>
          }
        >
          <ClientHome seasons={SEASONS_DATA} />
        </Suspense>
      </div>

      <section className="max-w-6xl mx-auto px-4 pb-16 pt-3">
        <h2 className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted mb-4">기수별 바로가기</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SEASONS_DATA.map((s, i) => (
            <a
              key={s.seasonNo}
              href={`/season/${s.seasonNo}`}
              className="surface rounded-2xl px-4 py-4 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/10 transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <strong className="text-xl tracking-tight">{s.seasonNo}기</strong>
                {i === 0 ? (
                  <span className="text-[9px] font-semibold px-1.5 py-1 rounded-full bg-[color:var(--accent-2)] text-white">NEW</span>
                ) : null}
              </div>
              <p className="text-xs text-muted line-clamp-2">{s.label}</p>
              <p className="text-[11px] text-muted mt-2.5">
                {s.participants.length}명 · EP{s.episodes[0].ep}
                {s.episodes.length > 1 ? `-${s.episodes.at(-1)!.ep}` : ''}
              </p>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
