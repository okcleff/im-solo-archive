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

      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-slate-400 hover:text-white text-sm mb-3 inline-flex items-center gap-1 transition-colors">
            ← 전체 기수
          </Link>
          <h1 className="text-3xl font-bold mt-2">나는 SOLO {season.seasonNo}기</h1>
          <p className="text-slate-300 mt-1">{season.label}</p>
          <div className="flex flex-wrap gap-2 mt-3 text-sm text-slate-400">
            {season.episodes.map((e) => (
              <span key={e.ep} className="bg-slate-700/50 px-2 py-0.5 rounded">
                EP{e.ep} · {e.airDate}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {males.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full" />
              남자 출연자 ({males.length}명)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {males.map((p) => (
                <ParticipantCard key={p.handle} participant={p} asLink />
              ))}
            </div>
          </section>
        )}
        {females.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-rose-600 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-rose-500 rounded-full" />
              여자 출연자 ({females.length}명)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
