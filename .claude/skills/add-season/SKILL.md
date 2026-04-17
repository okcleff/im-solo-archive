---
name: add-season
description: Use when adding a new season's participant data to the archive or updating existing season data. Covers the /fill-season command and JSON schema.
---

# Add Season

새 기수 데이터를 추가할 때는 `/fill-season {기수번호}` 커스텀 커맨드를 사용한다.

## 커맨드 실행

/fill-season 31

Claude가 웹 검색으로 데이터를 수집해 `src/entities/participant/lib/seasons/season-31.json`을 자동 생성한다.

## 파일 위치 및 네이밍

src/entities/participant/lib/seasons/season-{숫자}.json

## JSON 구조

{
  "seasonNo": 31,
  "label": "31기 (부제)",
  "episodes": [
    { "ep": 250, "airDate": "2026-06-04" }
  ],
  "participants": [
    {
      "seasonNo": 31,
      "gender": "M",
      "handle": "영수",
      "photo": { "src": null, "alt": "나는 SOLO 31기 영수" },
      "instagram": null,
      "profile": {
        "birthYear": 1992,
        "job": "직업",
        "region": "서울"
      },
      "sources": ["https://example.com/article"],
      "finalChoice": null
    }
  ]
}

## profile 필드

| 필드 | 타입 | 비고 |
|------|------|------|
| birthYear | number or null | 출생연도 |
| job | string or null | 직업/직책 |
| region | string or null | 거주 지역 |

traits, notableQuotes, issues는 스키마에 없다.

## 검증

npm run build

Zod 스키마 검증 포함 — 실패 시 에러 출력.

## 흔한 실수

- 각 participant에 seasonNo 빠뜨리기 → Zod 에러
- sources를 객체 배열로 작성 → string[]이어야 함
- instagram에 @ 포함 → username만 입력
- airDate 형식이 YYYY-MM-DD가 아닌 경우 → Zod 에러
