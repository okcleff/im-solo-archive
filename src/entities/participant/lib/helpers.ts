import type { Participant, Season } from '../model/schemas';

/**
 * 출연자 상세 페이지 경로를 생성한다.
 */
export function getParticipantUrl(p: Participant): string {
  return `/season/${p.seasonNo}/${p.gender.toLowerCase()}/${encodeURIComponent(p.handle)}`;
}

/**
 * 카드/메타 설명에 사용할 짧은 출연자 요약 문자열을 반환한다.
 *
 * 우선순위: 직업 -> 지역 -> 첫 번째 특징 -> `정보 미공개`
 */
export function getParticipantSummary(p: Participant): string {
  return (
    p.profile.job ||
    p.profile.region ||
    (p.profile.traits.length > 0 ? p.profile.traits[0] : '정보 미공개')
  );
}

/**
 * 시즌 목록에서 가장 최근 방영일을 ISO 날짜 문자열로 반환한다.
 *
 * @returns 시즌/회차 데이터가 비어 있으면 빈 문자열
 */
export function getLatestAirDate(seasons: Season[]): string {
  return (
    seasons
      .flatMap((s) => s.episodes.map((e) => e.airDate))
      .sort()
      .at(-1) ?? ''
  );
}

/**
 * 시즌 번호가 가장 큰 최신 시즌을 반환한다.
 */
export function getLatestSeason(seasons: Season[]): Season {
  return seasons.reduce((a, b) => (a.seasonNo > b.seasonNo ? a : b));
}
