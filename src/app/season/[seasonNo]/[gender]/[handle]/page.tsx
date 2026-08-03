import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  SEASONS_DATA,
  getParticipantByRoute,
  getSeasonByNo,
  getSameHandleParticipants,
} from "@/entities/participant/server";
import {
  formatKoreanAge,
  getFinalChoiceParticipant,
  getParticipantUrl,
  getParticipantSummary,
  buildPersonJsonLd,
  ParticipantDetailsSections,
} from "@/entities/participant";
import { getSiteUrl } from "@/shared/config/site";
import { getCurrentYear } from "@/shared/lib/utils";
import JsonLd from "@/shared/ui/JsonLd";

interface Props {
  params: Promise<{ seasonNo: string; gender: string; handle: string }>;
}

export function generateStaticParams() {
  return SEASONS_DATA.flatMap((s) =>
    s.participants.map((p) => ({
      seasonNo: String(p.seasonNo),
      gender: p.gender.toLowerCase(),
      handle: p.handle,
    })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seasonNo, gender, handle } = await params;
  const p = getParticipantByRoute(
    SEASONS_DATA,
    Number(seasonNo),
    gender,
    handle,
  );
  if (!p) return {};

  const base = getSiteUrl();
  const url = `${base}${getParticipantUrl(p)}`;
  const age = formatKoreanAge(p.profile.birthYear, getCurrentYear());
  const summary = getParticipantSummary(p);
  const title = `${p.handle} (나는 SOLO ${p.seasonNo}기) 프로필`;
  const fallbackDescription = `나는 SOLO ${p.seasonNo}기 ${p.gender === "M" ? "남" : "여"} 출연자 ${p.handle}. ${age !== "미공개" ? `${age} · ` : ""}${summary}`;
  const description = p.bio
    ? p.bio.slice(0, 157) + (p.bio.length > 157 ? "..." : "")
    : fallbackDescription;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "profile" },
  };
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default async function ParticipantPage({ params }: Props) {
  const { seasonNo, gender, handle } = await params;
  const season = getSeasonByNo(SEASONS_DATA, Number(seasonNo));
  if (!season) notFound();

  const p = getParticipantByRoute(
    SEASONS_DATA,
    Number(seasonNo),
    gender,
    handle,
  );
  if (!p) notFound();

  const base = getSiteUrl();
  const age = formatKoreanAge(p.profile.birthYear, getCurrentYear());
  const summary = getParticipantSummary(p);
  const finalChoiceParticipant = getFinalChoiceParticipant(season, p);
  const sameSeasonParticipants = season.participants.filter(
    (candidate) =>
      !(candidate.gender === p.gender && candidate.handle === p.handle),
  );
  const sameHandleParticipants = getSameHandleParticipants(SEASONS_DATA, p);

  const jsonLd = buildPersonJsonLd({ base, participant: p, summary });
  const genderLabel = p.gender === "M" ? "남성 출연자" : "여성 출연자";
  const accentTone = p.gender === "M" ? "badge-info" : "badge-error";

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="px-4 pt-8 sm:pt-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link
              href={`/season/${p.seasonNo}`}
              className="btn btn-ghost btn-sm rounded-full px-4"
            >
              ← {p.seasonNo}기 출연자 목록
            </Link>
            <span
              className={`badge ${accentTone} badge-outline h-8 px-3 font-semibold`}
            >
              {genderLabel}
            </span>
          </div>

          <p className="text-sm font-semibold text-secondary">
            나는 SOLO {p.seasonNo}기
          </p>
          <h1 className="mt-2 font-(--font-title) text-5xl tracking-tight text-base-content sm:text-6xl">
            {p.handle}
          </h1>
          <p className="mt-4 text-base leading-7 text-base-content/65 sm:text-lg">
            {summary}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-base-300 bg-base-100 px-4 py-3">
              <p className="text-[11px] font-semibold text-base-content/50">
                기수
              </p>
              <p className="mt-2 text-lg font-semibold">{p.seasonNo}기</p>
            </div>
            <div className="rounded-xl border border-base-300 bg-base-100 px-4 py-3">
              <p className="text-[11px] font-semibold text-base-content/50">
                출생
              </p>
              <p className="mt-2 text-lg font-semibold">
                {p.profile.birthYear ? `${p.profile.birthYear}년생` : "미공개"}
              </p>
            </div>
            <div className="rounded-xl border border-base-300 bg-base-100 px-4 py-3">
              <p className="text-[11px] font-semibold text-base-content/50">
                지역
              </p>
              <p className="mt-2 text-lg font-semibold">
                {p.profile.region ?? "미공개"}
              </p>
            </div>
          </div>

          {p.instagram ? (
            <div className="mt-6">
              <a
                href={`https://instagram.com/${p.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm rounded-full border-base-300 bg-base-100 px-4 shadow-none hover:bg-base-200"
                aria-label={`${p.handle} 인스타그램 @${p.instagram}`}
              >
                <InstagramIcon className="w-3.5 h-3.5" />@{p.instagram}
              </a>
            </div>
          ) : null}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        <section className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body p-5 sm:p-6">
            <h2 className="text-base font-semibold mb-4">기본 정보</h2>
            <ParticipantDetailsSections
              participant={p}
              age={age}
              finalChoiceParticipant={finalChoiceParticipant}
              hideAgeRegion
            />
          </div>
        </section>

        {p.bio && (
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body p-5 sm:p-6">
              <h2 className="text-base font-semibold mb-4">방송 하이라이트</h2>
              <p className="text-base-content/80 leading-relaxed text-sm">
                {p.bio}
              </p>
            </div>
          </section>
        )}

        {/* 같은 기수 · 동명 출연자로 이어지는 내부 링크.
            출연자 페이지끼리 서로를 참조해 크롤러가 상세 페이지를 순회할 수 있게 한다. */}
        {sameSeasonParticipants.length > 0 ? (
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body p-5 sm:p-6">
              <h2 className="text-base font-semibold mb-4">
                {p.seasonNo}기 다른 출연자
              </h2>
              <ul className="flex flex-wrap gap-2">
                {sameSeasonParticipants.map((candidate) => (
                  <li key={`${candidate.gender}-${candidate.handle}`}>
                    <Link
                      href={getParticipantUrl(candidate)}
                      className="btn btn-ghost btn-sm rounded-full border border-base-300 font-medium"
                    >
                      {candidate.handle}
                      <span className="text-[10px] text-base-content/45">
                        {candidate.gender === "M" ? "남" : "여"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {sameHandleParticipants.length > 0 ? (
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body p-5 sm:p-6">
              <h2 className="text-base font-semibold mb-1">
                다른 기수 {p.handle}
              </h2>
              <p className="mb-4 text-xs text-base-content/55">
                나는 SOLO는 기수마다 같은 가명을 사용합니다. 동명의 다른 기수
                출연자를 확인해 보세요.
              </p>
              <ul className="flex flex-wrap gap-2">
                {sameHandleParticipants.map((candidate) => (
                  <li key={`${candidate.seasonNo}-${candidate.gender}`}>
                    <Link
                      href={getParticipantUrl(candidate)}
                      className="btn btn-ghost btn-sm rounded-full border border-base-300 font-medium"
                    >
                      {candidate.seasonNo}기 {candidate.handle}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
