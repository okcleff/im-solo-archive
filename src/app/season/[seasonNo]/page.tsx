import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEASONS_DATA, getSeasonByNo } from '@/entities/participant/server';
import { ParticipantCard, getParticipantUrl, getParticipantSummary } from '@/entities/participant';
import { getSiteUrl } from '@/shared/config/site';
import JsonLd from '@/shared/ui/JsonLd';

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

interface Props {
  params: Promise<{ seasonNo: string }>;
}

export function generateStaticParams() {
  return SEASONS_DATA.map((s) => ({ seasonNo: String(s.seasonNo) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seasonNo } = await params;
  const season = getSeasonByNo(SEASONS_DATA, Number(seasonNo));
  if (!season) return {};

  const base = getSiteUrl();
  const url = `${base}/season/${season.seasonNo}`;
  const title = `나는 SOLO ${season.seasonNo}기 출연자 프로필 | ${season.label}`;
  const description = `나는 SOLO ${season.label} 출연자 ${season.participants.length}명 직업, 나이, 지역, 특징 총정리. ${season.participants.map((p) => p.handle).join('·')} 프로필 확인.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  };
}

export default async function SeasonPage({ params }: Props) {
  const { seasonNo } = await params;
  const season = getSeasonByNo(SEASONS_DATA, Number(seasonNo));
  if (!season) notFound();

  const base = getSiteUrl();
  const males = season.participants.filter((p) => p.gender === 'M');
  const females = season.participants.filter((p) => p.gender === 'F');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `나는 SOLO ${season.seasonNo}기 출연자 목록`,
    url: `${base}/season/${season.seasonNo}`,
    numberOfItems: season.participants.length,
    itemListElement: season.participants.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${p.handle} (나는 SOLO ${p.seasonNo}기)`,
      url: `${base}${getParticipantUrl(p)}`,
      description: getParticipantSummary(p),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="px-4 pt-8 sm:pt-12">
        <div className="hero max-w-6xl mx-auto rounded-[2rem] glass-panel">
          <div className="hero-content w-full flex-col items-start gap-5 px-6 py-8 sm:px-9 sm:py-10">
          <Link href="/" className="btn btn-ghost btn-sm -ml-3">
            ← 전체 기수
          </Link>
          <h1 className="mt-3 text-4xl sm:text-5xl font-(--font-title) tracking-tight">나는 SOLO {season.seasonNo}기</h1>
          <p className="mt-2 text-base-content/68">{season.label}</p>
          <div className="mt-5 flex flex-col gap-1.5 text-sm text-base-content/70">
            <p>
              <span className="font-semibold text-base-content">방영 회차</span>
              {" "}EP {season.episodes[0].ep} ~ {season.episodes[season.episodes.length - 1].ep}
            </p>
            <p>
              <span className="font-semibold text-base-content">방영 기간</span>
              {" "}{formatDate(season.episodes[0].airDate)} ~ {formatDate(season.episodes[season.episodes.length - 1].airDate)}
            </p>
          </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-10">
        {males.length > 0 ? (
          <section>
            <h2 className="section-title mb-4 flex items-center gap-2">
              <span className="badge badge-accent badge-xs" />남자 출연자 ({males.length}명)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {males.map((p) => (
                <ParticipantCard key={p.handle} participant={p} asLink />
              ))}
            </div>
          </section>
        ) : null}

        {females.length > 0 ? (
          <section>
            <h2 className="section-title mb-4 flex items-center gap-2">
              <span className="badge badge-secondary badge-xs" />여자 출연자 ({females.length}명)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {females.map((p) => (
                <ParticipantCard key={p.handle} participant={p} asLink />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
