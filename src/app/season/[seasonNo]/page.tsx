import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEASONS_DATA, ParticipantCard, getParticipantUrl, getParticipantSummary } from '@/entities/participant';
import { getSiteUrl } from '@/shared/config/site';
import JsonLd from '@/shared/ui/JsonLd';

interface Props {
  params: Promise<{ seasonNo: string }>;
}

export function generateStaticParams() {
  return SEASONS_DATA.map((s) => ({ seasonNo: String(s.seasonNo) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seasonNo } = await params;
  const season = SEASONS_DATA.find((s) => s.seasonNo === Number(seasonNo));
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
  const season = SEASONS_DATA.find((s) => s.seasonNo === Number(seasonNo));
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

      <section className="bg-[#0F0F0F] text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-white/40 hover:text-white/80 text-xs tracking-wide mb-4 inline-flex items-center gap-1 transition-colors">
            ← 전체 기수
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2 tracking-tight">나는 SOLO {season.seasonNo}기</h1>
          <p className="text-white/50 mt-1.5">{season.label}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {season.episodes.map((e) => (
              <span key={e.ep} className="bg-white/[0.07] border border-white/[0.08] text-white/40 text-xs px-2.5 py-1 rounded-full">
                EP{e.ep} · {e.airDate}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-12">
        {males.length > 0 && (
          <section>
            <h2 className="text-xs font-bold tracking-[0.18em] uppercase text-[#999] mb-5 flex items-center gap-2">
              <span className="w-1 h-3 bg-blue-500 rounded-full" />
              남자 출연자 ({males.length}명)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {males.map((p) => (
                <ParticipantCard key={p.handle} participant={p} asLink />
              ))}
            </div>
          </section>
        )}
        {females.length > 0 && (
          <section>
            <h2 className="text-xs font-bold tracking-[0.18em] uppercase text-[#999] mb-5 flex items-center gap-2">
              <span className="w-1 h-3 bg-rose-500 rounded-full" />
              여자 출연자 ({females.length}명)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {females.map((p) => (
                <ParticipantCard key={p.handle} participant={p} asLink />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
