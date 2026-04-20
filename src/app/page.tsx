import type { Metadata } from "next";
import { Suspense } from "react";
import { SEASONS_DATA } from "@/entities/participant/server";
import { getSiteUrl, SITE_NAME } from "@/shared/config/site";
import JsonLd from "@/shared/ui/JsonLd";
import { ClientHome } from "@/widgets/home-interactive";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: `나는 SOLO 출연자 아카이브 | 전 기수 프로필 총정리`,
  description: `나는 SOLO 전 기수 출연자 직업, 나이, 지역, 특징을 한눈에 검색하세요.`,
  alternates: { canonical: BASE },
  openGraph: {
    title: `나는 SOLO 출연자 아카이브`,
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
  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="max-w-6xl mx-auto px-4 pt-8 pb-2">
        <h1 className="text-xs font-bold tracking-[0.28em] uppercase text-[var(--color-base-content)]/55">
          나는 SOLO 출연진 아카이브
        </h1>
      </div>

      <div className="max-w-6xl mx-auto">
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-20">
              <span
                className="loading loading-spinner loading-md"
                aria-hidden="true"
              />
              <span className="ml-3 text-sm text-[var(--color-base-content)]/60">
                로딩 중...
              </span>
            </div>
          }
        >
          <ClientHome seasons={SEASONS_DATA} />
        </Suspense>
      </div>
    </>
  );
}
