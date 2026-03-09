import type { Participant } from '@/entities/participant';

function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

function parseSeasonAndKeyword(query: string): { seasonNo: number | null; keyword: string } {
  const normalized = normalize(query);
  if (!normalized) return { seasonNo: null, keyword: '' };

  // 예: "30", "30기", "30 기" 형태를 시즌 검색어로 인식
  const seasonMatch = normalized.match(/(?:^|\s)(\d{1,2})\s*기?(?=\s|$)/);
  const seasonNo = seasonMatch ? Number(seasonMatch[1]) : null;
  const keyword = normalized.replace(/(?:^|\s)\d{1,2}\s*기?(?=\s|$)/g, ' ').trim();

  return { seasonNo: Number.isNaN(seasonNo) ? null : seasonNo, keyword };
}

export function filterParticipants(
  participants: Participant[],
  gender: string,
  query: string,
): Participant[] {
  const { seasonNo, keyword } = parseSeasonAndKeyword(query);
  const keywordTokens = keyword ? keyword.split(' ') : [];

  return participants.filter((p) => {
    const matchGender =
      !gender || gender === 'all' || p.gender === gender.toUpperCase();

    const matchSeason = seasonNo == null || p.seasonNo === seasonNo;

    const searchable = normalize(
      [
        p.handle,
        p.profile.job ?? '',
        p.profile.region ?? '',
        ...p.profile.traits,
        ...p.profile.notableQuotes,
      ].join(' '),
    );

    const matchKeyword =
      keywordTokens.length === 0 || keywordTokens.every((token) => searchable.includes(token));

    return matchGender && matchSeason && matchKeyword;
  });
}
