/**
 * 출생 연도와 기준 연도를 받아 한국식 나이를 문자열로 반환한다.
 *
 * @param birthYear 출생 연도. 비공개인 경우 `null`
 * @param currentYear 계산 기준 연도
 * @returns 예: `34세`, 출생 연도가 없으면 `미공개`
 */
export function formatKoreanAge(
  birthYear: number | null,
  currentYear: number,
): string {
  if (birthYear === null) return '미공개';
  return `${currentYear - birthYear + 1}세`;
}
