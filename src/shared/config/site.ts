export const SITE_NAME = '나는 SOLO 아카이브';
export const SITE_DESCRIPTION =
  '나는 SOLO 전 기수 출연자 직업, 나이, 지역, 특징을 한눈에 검색하세요.';

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? 'https://im-solo-archive.vercel.app';
}
