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

/**
 * 기준 기수의 앞뒤 기수를 반환한다. 기수 페이지 간 순차 이동 링크에 사용한다.
 *
 * @returns `prev`는 한 기수 이전(번호가 작은 쪽), `next`는 한 기수 이후. 없으면 `null`
 */
export function getAdjacentSeasons(
  seasons: Season[],
  seasonNo: number,
): { prev: Season | null; next: Season | null } {
  return {
    prev: getSeasonByNo(seasons, seasonNo - 1),
    next: getSeasonByNo(seasons, seasonNo + 1),
  };
}

/**
 * 다른 기수에서 같은 이름(handle)으로 출연한 참가자 목록을 반환한다.
 *
 * `영수`, `옥순` 등 이름이 기수마다 재사용되는 특성을 이용해 기수 간 내부 링크를 만든다.
 *
 * @returns 기수 번호 내림차순 목록 (자기 자신 제외)
 */
export function getSameHandleParticipants(
  seasons: Season[],
  participant: Participant,
): Participant[] {
  return seasons
    .flatMap((season) => season.participants)
    .filter(
      (candidate) =>
        candidate.handle === participant.handle &&
        candidate.seasonNo !== participant.seasonNo,
    )
    .sort((a, b) => b.seasonNo - a.seasonNo);
}

/**
 * 출연자의 최종 선택 상대를 같은 기수 내 참가자 목록에서 찾는다.
 *
 * `finalChoice`는 이름만 저장하므로, 동일 기수의 반대 성별 참가자 중 handle이 일치하는 대상을 반환한다.
 */
export function getFinalChoiceParticipant(
  season: Season,
  participant: Participant,
): Participant | null {
  if (!participant.finalChoice) return null;

  return (
    season.participants.find(
      (candidate) =>
        candidate.gender !== participant.gender &&
        candidate.handle === participant.finalChoice,
    ) ?? null
  );
}
