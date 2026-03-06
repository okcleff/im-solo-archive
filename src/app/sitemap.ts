import type { MetadataRoute } from 'next';
import { SEASONS_DATA } from '@/entities/participant/lib/data';
import { getSiteUrl } from '@/shared/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  const seasonUrls: MetadataRoute.Sitemap = SEASONS_DATA.map((s) => ({
    url: `${base}/season/${s.seasonNo}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const participantUrls: MetadataRoute.Sitemap = SEASONS_DATA.flatMap((s) =>
    s.participants.map((p) => ({
      url: `${base}/season/${p.seasonNo}/${p.gender.toLowerCase()}/${encodeURIComponent(p.handle)}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
  );

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    ...seasonUrls,
    ...participantUrls,
  ];
}
