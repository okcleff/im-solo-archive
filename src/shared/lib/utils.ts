/** 한국식 나이 (세는 나이) = 현재 연도 - 출생연도 + 1 */
export function calcKoreanAge(birthYear: number | null): string {
  if (birthYear === null) return '미공개';
  return `${new Date().getFullYear() - birthYear + 1}세`;
}
