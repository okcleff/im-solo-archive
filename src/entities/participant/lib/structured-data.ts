/**
 * GEO(생성형 검색엔진 최적화)용 JSON-LD 엔티티 그래프 빌더.
 *
 * 핵심 아이디어: 페이지마다 고립된 스키마를 뿌리는 대신, 안정적인 `@id`로
 * 서로 참조하는 엔티티 그래프를 만든다. 이렇게 하면 AI/검색엔진이
 * "이 인물 = 나는 SOLO(TVSeries)의 N기(TVSeason) 출연자(actor)"라는
 * 관계를 추론하고 인용할 수 있다.
 *
 * 엔티티 계층: Organization(발행처) → WebSite → TVSeries(나는 SOLO)
 *   → TVSeason(기수) → Person(출연자)
 *
 * 순수 함수만 두어 서버/클라이언트 어디서든 import 가능하게 한다.
 */
import { SITE_NAME } from "@/shared/config/site";
import type { Participant, Season, ShowInfo } from "../model/schemas";
import { getParticipantUrl, getParticipantSummary } from "./helpers";

const LANG = "ko-KR";

/** 표기 변형 — 엔티티 동일성(entity disambiguation) 신호 */
const SITE_ALT_NAMES = [
  "나는솔로 아카이브",
  "나는 솔로 아카이브",
  "나는 솔로 출연자 아카이브",
  "나는 SOLO 역대 출연자 아카이브",
];

/** 프로그램명 표기 변형 (영문/한글 붙임·띄어쓰기) — 검색어 대응 */
const SHOW_ALT_NAMES = (titleEn: string) => [titleEn, "나는 솔로", "나는솔로"];

// ── 안정적 @id 앵커 ──────────────────────────────────────
const orgId = (base: string) => `${base}/#organization`;
const websiteId = (base: string) => `${base}/#website`;
const tvSeriesId = (base: string) => `${base}/#tvseries`;
const tvSeasonId = (base: string, seasonNo: number) =>
  `${base}/season/${seasonNo}#tvseason`;
const personId = (base: string, p: Participant) =>
  `${base}${getParticipantUrl(p)}#person`;

// ── 개별 엔티티 빌더 ─────────────────────────────────────

function organization(base: string) {
  return {
    "@type": "Organization",
    "@id": orgId(base),
    name: SITE_NAME,
    url: base,
    email: "imsoloarchive@gmail.com",
    logo: {
      "@type": "ImageObject",
      url: `${base}/favicon/apple-touch-icon.png`,
    },
  };
}

function website(base: string) {
  return {
    "@type": "WebSite",
    "@id": websiteId(base),
    name: SITE_NAME,
    alternateName: SITE_ALT_NAMES,
    url: base,
    inLanguage: LANG,
    publisher: { "@id": orgId(base) },
    about: { "@id": tvSeriesId(base) },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function tvSeries(base: string, showInfo: ShowInfo, seasons: Season[]) {
  return {
    "@type": "TVSeries",
    "@id": tvSeriesId(base),
    name: showInfo.titleKo,
    alternateName: SHOW_ALT_NAMES(showInfo.titleEn),
    url: base,
    inLanguage: LANG,
    numberOfSeasons: seasons.length,
    sameAs: showInfo.officialVod,
    containsSeason: seasons.map((s) => ({
      "@id": tvSeasonId(base, s.seasonNo),
    })),
  };
}

/** 시즌 페이지에서 쓰는 완전한 TVSeason 노드 (출연자를 actor로 연결) */
function tvSeason(base: string, season: Season) {
  const airDates = season.episodes.map((e) => e.airDate).sort();
  return {
    "@type": "TVSeason",
    "@id": tvSeasonId(base, season.seasonNo),
    name: `나는 SOLO ${season.seasonNo}기`,
    seasonNumber: season.seasonNo,
    url: `${base}/season/${season.seasonNo}`,
    inLanguage: LANG,
    numberOfEpisodes: season.episodes.length,
    startDate: airDates[0],
    endDate: airDates.at(-1),
    dateModified: airDates.at(-1),
    partOfSeries: {
      "@id": tvSeriesId(base),
      "@type": "TVSeries",
      name: "나는 SOLO",
    },
    actor: season.participants.map((p) => ({
      "@type": "Person",
      "@id": personId(base, p),
      name: p.handle,
      url: `${base}${getParticipantUrl(p)}`,
    })),
  };
}

/** 출연자 상세 페이지의 완전한 Person 노드 */
function person(base: string, p: Participant, summary: string) {
  const sameAs = [
    ...p.sources,
    ...(p.instagram ? [`https://instagram.com/${p.instagram}`] : []),
  ];
  return {
    "@type": "Person",
    "@id": personId(base, p),
    name: p.handle,
    gender: p.gender === "M" ? "Male" : "Female",
    birthDate: p.profile.birthYear ? String(p.profile.birthYear) : undefined,
    jobTitle: p.profile.job ?? undefined,
    homeLocation: p.profile.region
      ? { "@type": "Place", name: p.profile.region }
      : undefined,
    description: summary,
    url: `${base}${getParticipantUrl(p)}`,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
}

/** 상세 페이지에서 Person↔TVSeason 관계를 잇는 최소 TVSeason 노드 */
function tvSeasonForPerson(base: string, p: Participant) {
  return {
    "@type": "TVSeason",
    "@id": tvSeasonId(base, p.seasonNo),
    name: `나는 SOLO ${p.seasonNo}기`,
    seasonNumber: p.seasonNo,
    url: `${base}/season/${p.seasonNo}`,
    partOfSeries: {
      "@id": tvSeriesId(base),
      "@type": "TVSeries",
      name: "나는 SOLO",
    },
    actor: { "@id": personId(base, p) },
  };
}

function breadcrumb(base: string, items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

// ── 페이지별 @graph 조립기 ───────────────────────────────

export interface FaqItem {
  q: string;
  a: string;
}

/** 홈: Organization + WebSite + TVSeries + ItemList(기수) + FAQPage */
export function buildHomeJsonLd(params: {
  base: string;
  showInfo: ShowInfo;
  seasons: Season[];
  faq: FaqItem[];
}) {
  const { base, showInfo, seasons, faq } = params;
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization(base),
      website(base),
      tvSeries(base, showInfo, seasons),
      {
        "@type": "ItemList",
        name: `${SITE_NAME} 역대 기수 목록`,
        description: "나는 SOLO 역대 기수별 출연자 아카이브",
        url: base,
        itemListElement: seasons.map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: s.label,
          url: `${base}/season/${s.seasonNo}`,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
}

/** 기수: TVSeason(actor 연결) + BreadcrumbList */
export function buildSeasonJsonLd(params: { base: string; season: Season }) {
  const { base, season } = params;
  return {
    "@context": "https://schema.org",
    "@graph": [
      tvSeason(base, season),
      breadcrumb(base, [
        { name: "홈", url: base },
        {
          name: `나는 SOLO ${season.seasonNo}기`,
          url: `${base}/season/${season.seasonNo}`,
        },
      ]),
    ],
  };
}

/** 상세: Person + TVSeason(관계) + BreadcrumbList */
export function buildPersonJsonLd(params: {
  base: string;
  participant: Participant;
  summary?: string;
}) {
  const { base, participant: p } = params;
  const summary = params.summary ?? getParticipantSummary(p);
  return {
    "@context": "https://schema.org",
    "@graph": [
      person(base, p, summary),
      tvSeasonForPerson(base, p),
      breadcrumb(base, [
        { name: "홈", url: base },
        { name: `나는 SOLO ${p.seasonNo}기`, url: `${base}/season/${p.seasonNo}` },
        { name: p.handle, url: `${base}${getParticipantUrl(p)}` },
      ]),
    ],
  };
}
