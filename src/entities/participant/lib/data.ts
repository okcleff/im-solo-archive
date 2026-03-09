import 'server-only';
import fs from 'fs';
import path from 'path';
import type { Season, ShowInfo } from '../model/schemas';
import { SeasonSchema, ShowInfoSchema } from '../model/schemas';

export const SHOW_INFO: ShowInfo = ShowInfoSchema.parse({
  titleKo: '나는 SOLO',
  titleEn: 'I AM SOLO',
  officialVod: 'https://programs.sbs.co.kr/plus/iamsolo/vods/69610',
});

// seasons/ 폴더의 season-{숫자}.json 파일을 자동으로 수집
const seasonsDir = path.join(process.cwd(), 'src/entities/participant/lib/seasons');
const rawSeasons = fs
  .readdirSync(seasonsDir)
  .filter((f) => /^season-\d+\.json$/.test(f))
  .map((f) => JSON.parse(fs.readFileSync(path.join(seasonsDir, f), 'utf-8')));

/**
 * 전 기수 데이터.
 * - seasonNo 내림차순(최신순)으로 자동 정렬됨.
 * - 새 기수 추가: seasons/ 폴더에 season-{기수}.json 파일만 추가하면 자동 반영.
 * - instagram 필드: 실제 username 확인 후 입력 (@제외).
 */
export const SEASONS_DATA: Season[] = rawSeasons
  .map((raw) => {
    const result = SeasonSchema.safeParse(raw);
    if (!result.success) {
      throw new Error(
        `season-${(raw as { seasonNo?: number }).seasonNo ?? '?'}.json 데이터 검증 실패:\n${result.error.toString()}`,
      );
    }
    return result.data;
  })
  .sort((a, b) => b.seasonNo - a.seasonNo);

/** 가장 최신 기수 (배열 첫 번째 = 최신순 정렬 기준) */
export const LATEST_SEASON = SEASONS_DATA[0];
