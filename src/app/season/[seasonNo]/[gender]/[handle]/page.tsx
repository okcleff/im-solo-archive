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

  const accent = p.gender === 'M' ? 'from-blue-600 to-indigo-700' : 'from-rose-500 to-red-600';

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="px-4 pt-8 sm:pt-12">
        <div className={`max-w-3xl mx-auto rounded-[28px] bg-gradient-to-br ${accent} text-white p-6 sm:p-8 shadow-2xl`}>
          <Link href={`/season/${p.seasonNo}`} className="text-xs text-white/75 hover:text-white inline-flex items-center gap-1">
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
                className="inline-flex mt-4 items-center gap-1.5 text-sm bg-white/15 hover:bg-white/25 rounded-xl px-3 py-1.5"
                aria-label={`${p.handle} 인스타그램 @${p.instagram}`}
              >
                <InstagramIcon className="w-3.5 h-3.5" />@{p.instagram}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-base font-semibold mb-4">기본 정보</h2>
          <dl className="grid grid-cols-2 gap-4">
            <InfoItem label="나이" value={age} />
            <InfoItem label="직업" value={p.profile.job} />
            <InfoItem label="지역" value={p.profile.region} />
            <InfoItem label="성별" value={p.gender === 'M' ? '남' : '여'} />
          </dl>
        </section>

        {p.profile.traits.length > 0 ? (
          <section className="surface rounded-2xl p-5 sm:p-6">
            <h2 className="text-base font-semibold mb-3">특징</h2>
            <div className="flex flex-wrap gap-2">
              {p.profile.traits.map((t, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-sm font-semibold chip">{t}</span>
              ))}
            </div>
          </section>
        ) : null}

        {p.profile.notableQuotes.length > 0 ? (
          <section className="surface rounded-2xl p-5 sm:p-6">
            <h2 className="text-base font-semibold mb-3">화제 멘트</h2>
            <ul className="space-y-2.5">
              {p.profile.notableQuotes.map((q, i) => (
                <li key={i} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm italic">
                  {q}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {p.profile.issues.length > 0 ? (
          <section className="rounded-2xl p-5 sm:p-6 border border-amber-300/70 bg-amber-100/60 dark:bg-amber-950/30 dark:border-amber-900">
            <h2 className="text-base font-semibold mb-3 text-amber-700 dark:text-amber-400">이슈 / 미확인 정보</h2>
            <ul className="space-y-2">
              {p.profile.issues.map((issue, i) => (
                <li key={i} className="text-sm text-amber-800 dark:text-amber-200">- {issue}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {p.sources.length > 0 ? (
          <section className="surface rounded-2xl p-5 sm:p-6">
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
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[color:var(--accent)] underline underline-offset-2 hover:no-underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
            <SourceConfidenceLegend className="mt-4" />
          </section>
        ) : null}
      </div>
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</dt>
      <dd className="text-sm mt-0.5 font-medium">{value ?? '미공개'}</dd>
    </div>
  );
}
