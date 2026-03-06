import type { Season, ShowInfo } from "../model/types";
import { SeasonSchema, ShowInfoSchema } from "../model/schemas";

import s24 from "./seasons/season-24.json";
import s25 from "./seasons/season-25.json";
import s26 from "./seasons/season-26.json";
import s27 from "./seasons/season-27.json";
import s28 from "./seasons/season-28.json";
import s29 from "./seasons/season-29.json";
import s30 from "./seasons/season-30.json";

export const SHOW_INFO: ShowInfo = ShowInfoSchema.parse({
  titleKo: "나는 SOLO",
  titleEn: "I AM SOLO",
  officialVod: "https://programs.sbs.co.kr/plus/iamsolo/vods/69610",
});

const rawSeasons = [s24, s25, s26, s27, s28, s29, s30];

/**
 * 전 기수 데이터.
 * - seasonNo 내림차순(최신순)으로 자동 정렬됨. 기수 추가 시 seasons/ 폴더에 JSON 파일 추가.
 * - instagram 필드: 실제 username 확인 후 입력 (@제외).
 */
export const SEASONS_DATA: Season[] = rawSeasons
  .map((raw, i) => {
    const result = SeasonSchema.safeParse(raw);
    if (!result.success) {
      throw new Error(
        `season-${rawSeasons[i].seasonNo}.json 데이터 검증 실패:\n${result.error.toString()}`
      );
    }
    return result.data;
  })
  .sort((a, b) => b.seasonNo - a.seasonNo);

/** 가장 최신 기수 (배열 첫 번째 = 최신순 정렬 기준) */
export const LATEST_SEASON = SEASONS_DATA[0];
