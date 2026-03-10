import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEASONS_DATA } from '@/entities/participant/lib/data';
import { getParticipantUrl, getParticipantSummary, SourceConfidenceLegend } from '@/entities/participant';
import { getSiteUrl } from '@/shared/config/site';
import { calcKoreanAge } from '@/shared/lib/utils';
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

function findParticipant(seasonNo: string, gender: string, handle: string) {
  const season = SEASONS_DATA.find((s) => s.seasonNo === Number(seasonNo));
  return (
    season?.participants.find(
      (p) => p.gender.toLowerCase() === gender.toLowerCase() && p.handle === decodeURIComponent(handle),
    ) ?? null
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seasonNo, gender, handle } = await params;
  const p = findParticipant(seasonNo, gender, handle);
  if (!p) return {};

  const base = getSiteUrl();
  const url = `${base}${getParticipantUrl(p)}`;
  const age = calcKoreanAge(p.profile.birthYear);
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
  const p = findParticipant(seasonNo, gender, handle);
  if (!p) notFound();

  const base = getSiteUrl();
  const age = calcKoreanAge(p.profile.birthYear);
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
          <dl className="stats stats-vertical sm:stats-horizontal border border-base-300 bg-base-200/70 shadow-sm">
            <InfoItem label="나이" value={age} />
            <InfoItem label="직업" value={p.profile.job} />
            <InfoItem label="지역" value={p.profile.region} />
            <InfoItem label="성별" value={p.gender === 'M' ? '남' : '여'} />
          </dl>
          </div>
        </section>

        {p.profile.traits.length > 0 ? (
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body p-5 sm:p-6">
            <h2 className="text-base font-semibold mb-3">특징</h2>
            <div className="flex flex-wrap gap-2">
              {p.profile.traits.map((t, i) => (
                <span key={i} className="badge badge-outline h-8 px-3">{t}</span>
              ))}
            </div>
            </div>
          </section>
        ) : null}

        {p.profile.notableQuotes.length > 0 ? (
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body p-5 sm:p-6">
            <h2 className="text-base font-semibold mb-3">화제 멘트</h2>
            <ul className="space-y-2.5">
              {p.profile.notableQuotes.map((q, i) => (
                <li key={i} className="rounded-2xl border border-base-300 bg-base-200/60 px-4 py-3 text-sm italic shadow-sm">
                  {q}
                </li>
              ))}
            </ul>
            </div>
          </section>
        ) : null}

        {p.profile.issues.length > 0 ? (
          <section className="alert border border-warning/30 bg-warning/12 text-warning-content">
            <div>
            <h2 className="text-base font-semibold mb-3 text-warning">이슈 / 미확인 정보</h2>
            <ul className="space-y-2">
              {p.profile.issues.map((issue, i) => (
                <li key={i} className="text-sm opacity-90">- {issue}</li>
              ))}
            </ul>
            </div>
          </section>
        ) : null}

        {p.sources.length > 0 ? (
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body p-5 sm:p-6">
            <h2 className="text-base font-semibold mb-3">출처</h2>
            <ul className="space-y-2.5">
              {p.sources.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                      s.confidence === 'high' ? 'bg-emerald-500' : s.confidence === 'medium' ? 'bg-amber-500' : 'bg-rose-400'
                    }`}
                  />
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="link link-primary text-sm">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
            <SourceConfidenceLegend className="mt-4" />
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="stat">
      <dt className="stat-title text-xs font-semibold uppercase tracking-wide">{label}</dt>
      <dd className="stat-value mt-0 text-sm font-medium">{value ?? '미공개'}</dd>
    </div>
  );
}
