import type { MetadataRoute } from 'next';
import { SEASONS_DATA } from '@/entities/participant/server';
import { getSiteUrl } from '@/shared/config/site';

/**
 * 해당 기수의 마지막 방영일. sitemap의 lastmod 기준값으로 사용한다.
 *
 * 모든 URL에 `new Date()`를 넣으면 매 요청마다 전 페이지가 "방금 수정됨"으로
 * 보고되어 Google이 lastmod 신호 자체를 신뢰하지 않게 된다. 데이터가 실제로
 * 바뀌는 시점(기수 방영)을 반영해야 크롤 우선순위가 제대로 매겨진다.
 */
function getSeasonLastModified(episodes: { airDate: string }[]): Date {
  const latest = episodes.map((e) => e.airDate).sort().at(-1);
  return new Date(latest ?? '2021-07-15');
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const latestSeasonNo = SEASONS_DATA[0]?.seasonNo;
  const siteLastModified = getSeasonLastModified(
    SEASONS_DATA.flatMap((s) => s.episodes),
  );

  const seasonUrls: MetadataRoute.Sitemap = SEASONS_DATA.map((s) => ({
    url: `${base}/season/${s.seasonNo}`,
    lastModified: getSeasonLastModified(s.episodes),
    changeFrequency: s.seasonNo === latestSeasonNo ? 'weekly' : 'yearly',
    priority: s.seasonNo === latestSeasonNo ? 0.9 : 0.8,
  }));

  const participantUrls: MetadataRoute.Sitemap = SEASONS_DATA.flatMap((s) => {
    const lastModified = getSeasonLastModified(s.episodes);
    const isLatest = s.seasonNo === latestSeasonNo;
    return s.participants.map((p) => ({
      url: `${base}/season/${p.seasonNo}/${p.gender.toLowerCase()}/${encodeURIComponent(p.handle)}`,
      lastModified,
      changeFrequency: isLatest ? ('weekly' as const) : ('yearly' as const),
      priority: isLatest ? 0.8 : 0.6,
    }));
  });

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/about`, lastModified: siteLastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacy`, lastModified: siteLastModified, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/disclaimer`, lastModified: siteLastModified, changeFrequency: 'yearly', priority: 0.2 },
  ];

  return [
    {
      url: base,
      lastModified: siteLastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...seasonUrls,
    ...participantUrls,
    ...staticUrls,
  ];
}
