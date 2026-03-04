import type { Participant, Season } from '../model/types';

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

export function getLatestAirDate(seasons: Season[]): string {
  return (
    seasons
      .flatMap((s) => s.episodes.map((e) => e.airDate))
      .sort()
      .at(-1) ?? ''
  );
}

export function getLatestSeason(seasons: Season[]): Season {
  return seasons.reduce((a, b) => (a.seasonNo > b.seasonNo ? a : b));
}
