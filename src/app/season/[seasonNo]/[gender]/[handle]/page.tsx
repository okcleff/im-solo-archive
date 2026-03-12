import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEASONS_DATA, getParticipantByRoute } from '@/entities/participant/server';
import {
  formatKoreanAge,
  getParticipantUrl,
  getParticipantSummary,
  ParticipantDetailsSections,
} from '@/entities/participant';
import { getSiteUrl } from '@/shared/config/site';
import { getCurrentYear } from '@/shared/lib/utils';
import JsonLd from '@/shared/ui/JsonLd';

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
  const p = getParticipantByRoute(SEASONS_DATA, Number(seasonNo), gender, handle);
  if (!p) return {};

  const base = getSiteUrl();
  const url = `${base}${getParticipantUrl(p)}`;
  const age = formatKoreanAge(p.profile.birthYear, getCurrentYear());
  const summary = getParticipantSummary(p);
  const title = `${p.handle} (나는 SOLO ${p.seasonNo}기) 프로필`;
  const description = `나는 SOLO ${p.seasonNo}기 ${p.gender === 'M' ? '남' : '여'} 출연자 ${p.handle}. ${age !== '미공개' ? `${age} · ` : ''}${summary}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'profile' },
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
  const p = getParticipantByRoute(SEASONS_DATA, Number(seasonNo), gender, handle);
  if (!p) notFound();

  const base = getSiteUrl();
  const age = formatKoreanAge(p.profile.birthYear, getCurrentYear());
  const summary = getParticipantSummary(p);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: `${p.handle} (나는 SOLO ${p.seasonNo}기)`,
    description: summary,
    jobTitle: p.profile.job ?? undefined,
    homeLocation: p.profile.region ? { '@type': 'Place', name: p.profile.region } : undefined,
    url: `${base}${getParticipantUrl(p)}`,
    sameAs: [...p.sources.map((s) => s.url), ...(p.instagram ? [`https://instagram.com/${p.instagram}`] : [])],
  };

  const accent = p.gender === 'M' ? 'from-accent to-primary' : 'from-secondary to-primary';

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="px-4 pt-8 sm:pt-12">
        <div className={`hero max-w-3xl mx-auto rounded-[2rem] bg-gradient-to-br ${accent} text-white shadow-2xl`}>
          <div className="hero-content w-full items-start px-6 py-8 sm:px-8">
          <Link href={`/season/${p.seasonNo}`} className="btn btn-ghost btn-sm border-none bg-white/10 text-white hover:bg-white/20">
            ← {p.seasonNo}기 출연자 목록
          </Link>
          <div className="mt-4">
            <p className="text-xs text-white/75">{p.seasonNo}기 · {p.gender === 'M' ? '남' : '여'}</p>
            <h1 className="text-4xl sm:text-5xl font-[var(--font-title)] tracking-tight mt-1">{p.handle}</h1>
            <p className="text-sm text-white/85 mt-2">{summary}</p>
            {p.instagram ? (
              <a
                href={`https://instagram.com/${p.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm mt-4 border-none bg-white/15 text-white hover:bg-white/25"
                aria-label={`${p.handle} 인스타그램 @${p.instagram}`}
              >
                <InstagramIcon className="w-3.5 h-3.5" />@{p.instagram}
              </a>
            ) : null}
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
              showGender
              showLegend
            />
          </div>
        </section>
      </div>
    </>
  );
}
