import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEASONS_DATA, getParticipantUrl, getParticipantSummary, SourceConfidenceLegend } from '@/entities/participant';
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
      (p) =>
        p.gender.toLowerCase() === gender.toLowerCase() &&
        p.handle === decodeURIComponent(handle),
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
    sameAs: [
      ...p.sources.map((s) => s.url),
      ...(p.instagram ? [`https://instagram.com/${p.instagram}`] : []),
    ],
  };

  const accentGrad = p.gender === 'M' ? 'from-[#1C2B4A] to-[#070E1D]' : 'from-[#C01442] to-[#7F0E2C]';
  const accentText = p.gender === 'M' ? 'text-blue-700 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400';
  const accentBadge = p.gender === 'M'
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300';

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className={`bg-gradient-to-br ${accentGrad} text-white py-12 px-4`}>
        <div className="max-w-2xl mx-auto">
          <Link href={`/season/${p.seasonNo}`}
            className="text-white/70 hover:text-white/80 text-xs tracking-wide mb-4 inline-flex items-center gap-1 transition-colors">
            ← {p.seasonNo}기 출연자 목록
          </Link>
          <div className="flex items-end gap-5 mt-3">
            <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center text-4xl font-bold shrink-0">
              {p.handle[0]}
            </div>
            <div className="min-w-0">
              <div className="text-white/70 text-xs">{p.seasonNo}기 · {p.gender === 'M' ? '남' : '여'}</div>
              <h1 className="text-4xl font-bold flex items-center gap-3 flex-wrap">
                {p.handle}
                {p.instagram && (
                  <a
                    href={`https://instagram.com/${p.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${p.handle} 인스타그램 @${p.instagram}`}
                    className="inline-flex items-center gap-1.5 text-sm font-normal text-white/70
                      hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    @{p.instagram}
                  </a>
                )}
              </h1>
              <p className="text-white/80 mt-1 text-sm">{summary}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* 기본 정보 */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
          <h2 className={`text-base font-bold mb-4 ${accentText}`}>기본 정보</h2>
          <dl className="grid grid-cols-2 gap-4">
            <InfoItem label="나이" value={age} />
            <InfoItem label="직업" value={p.profile.job} />
            <InfoItem label="지역" value={p.profile.region} />
            <InfoItem label="성별" value={p.gender === 'M' ? '남' : '여'} />
            {p.instagram && (
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">인스타그램</dt>
                <dd className="mt-0.5">
                  <a
                    href={`https://instagram.com/${p.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${p.instagram} 인스타그램 (새 탭에서 열림)`}
                    className="text-sm text-rose-600 dark:text-rose-400 underline hover:no-underline font-medium flex items-center gap-1"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    @{p.instagram}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>

        {p.profile.traits.length > 0 && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <h2 className={`text-base font-bold mb-3 ${accentText}`}>특징</h2>
            <div className="flex flex-wrap gap-2">
              {p.profile.traits.map((t, i) => (
                <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium ${accentBadge}`}>{t}</span>
              ))}
            </div>
          </section>
        )}

        {p.profile.notableQuotes.length > 0 && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <h2 className={`text-base font-bold mb-3 ${accentText}`}>화제 멘트</h2>
            <ul className="space-y-3">
              {p.profile.notableQuotes.map((q, i) => (
                <li key={i} className="text-slate-700 dark:text-slate-300 text-sm italic border-l-4 border-rose-300 dark:border-rose-700 pl-4 py-1">{q}</li>
              ))}
            </ul>
          </section>
        )}

        {p.profile.issues.length > 0 && (
          <section className="bg-amber-50 dark:bg-amber-950/50 rounded-2xl border border-amber-200 dark:border-amber-900 p-6">
            <h2 className="text-base font-bold mb-3 text-amber-700 dark:text-amber-400">이슈 / 미확인 정보</h2>
            <ul className="space-y-2">
              {p.profile.issues.map((issue, i) => (
                <li key={i} className="text-sm text-amber-800 dark:text-amber-300 flex gap-2"><span aria-hidden="true">⚠</span><span>{issue}</span></li>
              ))}
            </ul>
          </section>
        )}

        {p.sources.length > 0 && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <h2 className={`text-base font-bold mb-3 ${accentText}`}>출처</h2>
            <ul className="space-y-3">
              {p.sources.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    role="img"
                    aria-label={s.confidence === 'high' ? '고신뢰' : s.confidence === 'medium' ? '중간 신뢰' : '낮은 신뢰'}
                    className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                      s.confidence === 'high' ? 'bg-green-500' : s.confidence === 'medium' ? 'bg-yellow-500' : 'bg-red-400'
                    }`}
                  />
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                    aria-label={`${s.title} (새 탭에서 열림)`}
                    className="text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline leading-snug">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
            <SourceConfidenceLegend className="mt-4" />
          </section>
        )}
      </div>
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-slate-800 dark:text-slate-100 mt-0.5 font-medium">{value ?? '미공개'}</dd>
    </div>
  );
}
