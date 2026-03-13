import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
      ...p.sources.map((s) => s.url),
      ...(p.instagram ? [`https://instagram.com/${p.instagram}`] : []),
    ],
  };
  const genderLabel = p.gender === "M" ? "남성 출연자" : "여성 출연자";
  const accentTone = p.gender === "M" ? "badge-info" : "badge-error";
  const photoBadgeTone =
    p.gender === "M"
      ? "bg-accent text-accent-content"
      : "bg-secondary text-secondary-content";

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="px-4 pt-8 sm:pt-12">
        <div className="detail-hero-shell mx-auto max-w-5xl rounded-[2rem] p-4 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-stretch">
            <div className="detail-hero-photo relative overflow-hidden rounded-[1.6rem]">
              <div className="relative aspect-[4/5]">
                {p.photo.src ? (
                  <Image
                    src={p.photo.src}
                    alt={p.photo.alt}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 320px"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-200 px-6 text-center text-base-content">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-base-content/40">
                      solo archive
                    </span>
                    <strong className="mt-4 font-[var(--font-title)] text-7xl leading-none tracking-tight text-base-content/18">
                      {p.seasonNo}
                    </strong>
                    <span className="mt-4 rounded-full border border-base-300 bg-base-100 px-4 py-2 text-sm font-semibold">
                      {p.handle}
                    </span>
                  </div>
                )}
              </div>
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4">
                <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                  나는 SOLO {p.seasonNo}기
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm ${photoBadgeTone}`}
                >
                  {p.gender === "M" ? "남" : "여"}
                </span>
              </div>
            </div>

            <div className="detail-hero-panel rounded-[1.6rem] p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-3">
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

              <div className="mt-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-base-content/45">
                  info
                </p>
                <h1 className="mt-3 font-[var(--font-title)] text-5xl tracking-tight text-base-content sm:text-6xl">
                  {p.handle}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-base-content/72 sm:text-lg">
                  {summary}
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-base-300/80 bg-base-200/70 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/45">
                    season
                  </p>
                  <p className="mt-2 text-lg font-semibold">{p.seasonNo}기</p>
                </div>
                <div className="rounded-2xl border border-base-300/80 bg-base-200/70 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/45">
                    age
                  </p>
                  <p className="mt-2 text-lg font-semibold">{age}</p>
                </div>
                <div className="rounded-2xl border border-base-300/80 bg-base-200/70 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/45">
                    region
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {p.profile.region ?? "미공개"}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {p.instagram ? (
                  <a
                    href={`https://instagram.com/${p.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm rounded-full border-base-300 bg-base-100 px-4 shadow-none hover:bg-base-200"
                    aria-label={`${p.handle} 인스타그램 @${p.instagram}`}
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />@{p.instagram}
                  </a>
                ) : null}
                <span className="text-sm text-base-content/52">
                  {p.profile.job ?? "직업 미공개"}
                </span>
              </div>
            </div>
          </div>
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
              showLegend
            />
          </div>
        </section>
      </div>
    </>
  );
}
