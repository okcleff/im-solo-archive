import type { Metadata } from "next";
import Link from "next/link";
import { SEASONS_DATA, SHOW_INFO } from "@/entities/participant/server";
import { getSiteUrl } from "@/shared/config/site";

const BASE = getSiteUrl();
const CONTACT_EMAIL = "imsoloarchive@gmail.com";

export const metadata: Metadata = {
  title: "사이트 소개",
  description:
    "나는 SOLO(나는 솔로) 역대 기수별 출연자 아카이브 소개 — 데이터 출처, 운영 원칙, 정정·제보 안내.",
  alternates: { canonical: `${BASE}/about` },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  const latestSeasonNo = SEASONS_DATA[0].seasonNo;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-(--font-title) tracking-tight">
        사이트 소개
      </h1>
      <p className="mt-4 text-sm sm:text-base leading-relaxed text-base-content/75">
        &lsquo;나는 SOLO 아카이브&rsquo;는 SBS Plus 연애 예능 &lsquo;나는
        SOLO(나는 솔로)&rsquo;의 1기부터 최신 {latestSeasonNo}기까지, 역대 기수별
        출연자 정보를 한곳에 정리한 <strong>비공식 팬 아카이브</strong>입니다.
        출연자의 직업·나이·거주 지역·특징과 방영 중 화제가 된 순간을 기수별로
        검색하고 비교할 수 있습니다.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">운영 원칙</h2>
        <ul className="mt-2 list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-base-content/75">
          <li>
            <strong>데이터 출처:</strong> 공개된 뉴스 기사·보도 등을 기반으로
            정리하며, 각 출연자 페이지에 참고한 출처 링크를 제공합니다.
          </li>
          <li>
            <strong>비공식·비영리:</strong> 방송사·제작진과 무관한 팬 제작
            사이트입니다.
          </li>
          <li>
            <strong>초상권 보호:</strong> 출연자의 사진은 게재하지 않으며, 확인이
            필요한 경우 출처 링크를 통해 안내합니다.
          </li>
          <li>
            <strong>정보의 정확성:</strong> 정보에 누락·오류가 있을 수 있으며,
            제보를 통해 지속적으로 보완합니다.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">정정 · 삭제 · 제보</h2>
        <p className="mt-2 text-sm leading-relaxed text-base-content/75">
          게시된 정보의 정정·삭제를 원하는 당사자 또는 관계자, 그리고 정보 보완
          제보는 아래 이메일로 보내주세요. 확인 후 신속히 처리합니다.
        </p>
        <p className="mt-2 text-sm">
          <a href={`mailto:${CONTACT_EMAIL}`} className="link link-primary">
            {CONTACT_EMAIL}
          </a>
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">관련 링크</h2>
        <ul className="mt-2 space-y-1.5 text-sm">
          <li>
            <a
              href={SHOW_INFO.officialVod}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary"
            >
              나는 SOLO 공식 VOD (SBS Plus)
            </a>
          </li>
          <li>
            <Link href="/privacy" className="link link-primary">
              개인정보처리방침
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
