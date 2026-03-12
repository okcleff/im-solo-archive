/**
 * 현재 연도를 반환한다.
 *
 * 테스트나 서버/클라이언트 경계 제어를 위해 기준 날짜를 주입할 수 있다.
 */
export function getCurrentYear(date: Date = new Date()): number {
  return date.getFullYear();
}
