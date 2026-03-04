import type { Participant, Season } from './types';

/** 한국식 나이 (세는 나이) = 현재 연도 - 출생연도 + 1 */
export function calcKoreanAge(birthYear: number | null): string {
  if (birthYear === null) return '미공개';
  const currentYear = new Date().getFullYear();
  return `${currentYear - birthYear + 1}세`;
}

export function getParticipantUrl(p: Participant): string {
  return `/season/${p.seasonNo}/${p.gender.toLowerCase()}/${encodeURIComponent(p.handle)}`;
}

export function getParticipantSummary(p: Participant): string {
  return (
    p.profile.job ||
    p.profile.region ||
    (p.profile.traits.length > 0 ? p.profile.traits[0] : '정보 미공개')
  );
}

export function filterParticipants(
  participants: Participant[],
  gender: string,
  query: string,
): Participant[] {
  return participants.filter((p) => {
    const matchGender =
      !gender || gender === 'all' || p.gender === gender.toUpperCase();

    const q = query.toLowerCase().trim();
    const matchQuery =
      !q ||
      p.handle.toLowerCase().includes(q) ||
      (p.profile.job?.toLowerCase().includes(q) ?? false) ||
      (p.profile.region?.toLowerCase().includes(q) ?? false) ||
      p.profile.traits.some((t) => t.toLowerCase().includes(q)) ||
      p.profile.notableQuotes.some((nq) => nq.toLowerCase().includes(q));

    return matchGender && matchQuery;
  });
}

export function getLatestAirDate(seasons: Season[]): string {
  const all = seasons.flatMap((s) => s.episodes.map((e) => e.airDate));
  return all.sort().at(-1) ?? '';
}

export function getLatestSeason(seasons: Season[]): Season {
  return seasons.reduce((a, b) => (a.seasonNo > b.seasonNo ? a : b));
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? 'https://im-solo-archive.vercel.app';
}
