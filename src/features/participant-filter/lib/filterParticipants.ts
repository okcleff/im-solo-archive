import type { Participant } from '@/entities/participant';

/**
 * 검색 비교를 위해 문자열을 소문자 + 단일 공백 형태로 정규화한다.
 */
function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * 자유 입력 검색어에서 기수 번호와 일반 키워드를 분리한다.
 *
 * 예:
 * - `30기 영수` -> `{ seasonNo: 30, keyword: '영수' }`
 * - `서울 옥순` -> `{ seasonNo: null, keyword: '서울 옥순' }`
 */
function parseSeasonAndKeyword(query: string): { seasonNo: number | null; keyword: string } {
  const normalized = normalize(query);
  if (!normalized) return { seasonNo: null, keyword: '' };

  // 예: "30", "30기", "30 기" 형태를 시즌 검색어로 인식
  const seasonMatch = normalized.match(/(?:^|\s)(\d{1,2})\s*기?(?=\s|$)/);
  const seasonNo = seasonMatch ? Number(seasonMatch[1]) : null;
  const keyword = normalized.replace(/(?:^|\s)\d{1,2}\s*기?(?=\s|$)/g, ' ').trim();

  return { seasonNo: Number.isNaN(seasonNo) ? null : seasonNo, keyword };
}

/**
 * 성별과 검색어 조건으로 출연자 목록을 필터링한다.
 *
 * 검색어는 `기수 + 키워드` 조합을 지원하며, 키워드는 공백 단위 AND 검색으로 동작한다.
 *
 * @param participants 검색 대상 출연자 목록
 * @param gender `all`, `M`, `F` 중 하나를 기대
 * @param query 자유 입력 검색어
 */
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
      [p.handle, p.profile.job ?? '', p.profile.region ?? ''].join(' '),
    );

    const matchKeyword =
      keywordTokens.length === 0 || keywordTokens.every((token) => searchable.includes(token));

    return matchGender && matchSeason && matchKeyword;
  });
}
