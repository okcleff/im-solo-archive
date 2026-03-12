import type { Participant, Season } from '../model/schemas';

/**
 * 기수 번호로 시즌을 조회한다.
 *
 * @param seasons 검색 대상 시즌 목록
 * @param seasonNo 찾을 기수 번호
 * @returns 일치하는 시즌, 없으면 `null`
 */
export function getSeasonByNo(
  seasons: Season[],
  seasonNo: number,
): Season | null {
  return seasons.find((season) => season.seasonNo === seasonNo) ?? null;
}

/**
 * 동적 라우트 파라미터 조합으로 출연자를 조회한다.
 *
 * `handle`은 URL 인코딩된 값이 들어올 수 있으므로 내부에서 decode 후 비교한다.
 *
 * @param seasons 검색 대상 시즌 목록
 * @param seasonNo 기수 번호
 * @param gender 성별 경로 값 (`m`, `f`, `M`, `F`)
 * @param handle URL 세그먼트의 출연자 이름
 * @returns 일치하는 출연자, 없으면 `null`
 */
export function getParticipantByRoute(
  seasons: Season[],
  seasonNo: number,
  gender: string,
  handle: string,
): Participant | null {
  const season = getSeasonByNo(seasons, seasonNo);
  if (!season) return null;

  return (
    season.participants.find(
      (participant) =>
        participant.gender.toLowerCase() === gender.toLowerCase() &&
        participant.handle === decodeURIComponent(handle),
    ) ?? null
  );
}
