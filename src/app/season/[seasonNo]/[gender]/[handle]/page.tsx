import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  SEASONS_DATA,
  getParticipantByRoute,
  getSeasonByNo,
} from "@/entities/participant/server";
import {
  formatKoreanAge,
  getFinalChoiceParticipant,
  getParticipantUrl,
  getParticipantSummary,
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
  const description = `나는 SOLO ${p.seasonNo}기 ${p.gender === "M" ? "남" : "여"} 출연자 ${p.handle}. ${age !== "미공개" ? `${age} · ` : ""}${summary}`;

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

  const p = getParticipantByRoute(SEASONS_DATA, Number(seasonNo), gender, handle);
  if (!p) notFound();

  const base = getSiteUrl();
  const age = formatKoreanAge(p.profile.birthYear, getCurrentYear());
  const summary = getParticipantSummary(p);
  const finalChoiceParticipant = getFinalChoiceParticipant(season, p);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `${p.handle} (나는 SOLO ${p.seasonNo}기)`,
    description: summary,
    jobTitle: p.profile.job ?? undefined,
    homeLocation: p.profile.region
      ? { "@type": "Place", name: p.profile.region }
      : undefined,
    url: `${base}${getParticipantUrl(p)}`,
    sameAs: [
      ...p.sources,
      ...(p.instagram ? [`https://instagram.com/${p.instagram}`] : []),
    ],
  };
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

          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-base-content/45">
            info
          </p>
          <h1 className="mt-3 font-(--font-title) text-5xl tracking-tight text-base-content sm:text-6xl">
            {p.handle}
          </h1>
          <p className="mt-4 text-base leading-7 text-base-content/65 sm:text-lg">
            {summary}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-base-300 bg-base-200 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/45">
                season
              </p>
              <p className="mt-2 text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                {p.seasonNo}기
              </p>
            </div>
            <div className="rounded-xl border border-base-300 bg-base-200 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/45">
                age
              </p>
              <p className="mt-2 text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                {age}
              </p>
            </div>
            <div className="rounded-xl border border-base-300 bg-base-200 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/45">
                region
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
              showGender
            />
          </div>
        </section>
      </div>
    </>
  );
}
