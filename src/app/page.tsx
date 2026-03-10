import type { Metadata } from "next";
import { Suspense } from "react";
import { SEASONS_DATA, LATEST_SEASON } from "@/entities/participant/lib/data";
import { getLatestAirDate } from "@/entities/participant";
import { getSiteUrl, SITE_NAME } from "@/shared/config/site";
import JsonLd from "@/shared/ui/JsonLd";
import { ClientHome } from "@/widgets/home-interactive";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: `나는 SOLO 출연자 아카이브 | 전 기수 프로필 총정리`,
  description: `나는 SOLO 전 기수 출연자 직업, 나이, 지역, 특징을 한눈에 검색하세요. 현재 ${LATEST_SEASON.seasonNo}기(${LATEST_SEASON.label}) 방영 중.`,
  alternates: { canonical: BASE },
  openGraph: {
    title: `나는 SOLO 출연자 아카이브 | ${LATEST_SEASON.seasonNo}기 포함 전 기수`,
    description: "나는 SOLO 전 기수 출연자 프로필을 검색하고 비교하세요.",
    url: BASE,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${SITE_NAME} 기수 목록`,
  description: "나는 SOLO 전 기수 출연자 아카이브",
  url: BASE,
  itemListElement: SEASONS_DATA.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: s.label,
    url: `${BASE}/season/${s.seasonNo}`,
  })),
};

export default function HomePage() {
  const latestAirDate = getLatestAirDate(SEASONS_DATA);
  const totalParticipants = SEASONS_DATA.reduce(
    (acc, s) => acc + s.participants.length,
    0,
  );

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="px-4 pt-8 pb-6 sm:pt-12">
        <div className="max-w-6xl mx-auto grid gap-4 lg:grid-cols-[1.4fr_0.85fr]">
          <div className="glass-panel rounded-[2rem] p-7 sm:p-10">
            <div className="badge badge-primary badge-outline mb-5 h-8 px-4">
              비공식 팬 아카이브
            </div>
            <h1 className="font-[var(--font-title)] text-4xl sm:text-6xl leading-[1.02] tracking-tight">
              나는 SOLO 출연진
              <br />
              아카이브
            </h1>
            <p className="mt-5 max-w-3xl text-base sm:text-lg leading-relaxed text-base-content/72">
              시즌별 출연자 정보를 모아 볼 수 있게 재구성한 팬 아카이브입니다.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="card border border-primary/20 bg-primary text-primary-content shadow-lg">
              <div className="card-body gap-2">
                <p className="text-xs uppercase tracking-[0.24em] text-primary-content/70">
                  latest season
                </p>
                <h2 className="font-[var(--font-title)] text-4xl">
                  {LATEST_SEASON.seasonNo}기
                </h2>
                <p className="text-sm text-primary-content/78">
                  {LATEST_SEASON.label}
                </p>
                <div className="badge badge-neutral badge-outline mt-2 w-fit border-primary-content/25 text-primary-content">
                  {latestAirDate}
                </div>
              </div>
            </div>

            <div className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="stats stats-vertical bg-transparent shadow-none">
                  <div className="stat px-0 pb-4 pt-0">
                    <div className="stat-title">기수 수</div>
                    <div className="stat-value text-3xl">
                      {SEASONS_DATA.length}
                    </div>
                  </div>
                  <div className="stat border-t border-base-300 px-0 py-4">
                    <div className="stat-title">등록 인원</div>
                    <div className="stat-value text-3xl">
                      {totalParticipants}
                    </div>
                  </div>
                  <div className="stat border-t border-base-300 px-0 pt-4">
                    <div className="stat-desc">검색과 시즌 탐색 모두 지원</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto">
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-20">
              <span
                className="loading loading-spinner loading-md text-primary"
                aria-hidden="true"
              />
              <span className="ml-3 text-base-content/60">로딩 중...</span>
            </div>
          }
        >
          <ClientHome seasons={SEASONS_DATA} />
        </Suspense>
      </div>

      <section className="max-w-6xl mx-auto px-4 pb-16 pt-3">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="section-title">기수별 바로가기</h2>
          <div className="badge badge-outline badge-secondary">11개 시즌</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
          {SEASONS_DATA.map((s, i) => (
            <a
              key={s.seasonNo}
              href={`/season/${s.seasonNo}`}
              className={`card border border-base-300 bg-base-100 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${
                i === 0
                  ? "xl:col-span-5"
                  : i === 1 || i === 2
                    ? "xl:col-span-3"
                    : "xl:col-span-2"
              }`}
            >
              <div className="card-body gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <strong className="text-3xl tracking-tight font-[var(--font-title)]">
                    {s.seasonNo}기
                  </strong>
                  {i === 0 ? (
                    <span className="badge badge-secondary">NEW</span>
                  ) : null}
                </div>
                <p className="text-sm line-clamp-2 text-base-content/70">
                  {s.label}
                </p>
                <div className="card-actions justify-between items-center pt-2 text-xs text-base-content/55">
                  <span>{s.participants.length}명</span>
                  <span>
                    EP{s.episodes[0].ep}
                    {s.episodes.length > 1 ? `-${s.episodes.at(-1)!.ep}` : ""}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
