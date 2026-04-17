---
name: add-season
description: Use when adding a new season's participant data to the archive, updating existing season data, or modifying the season JSON schema.
---

# Add Season

새 기수 데이터를 아카이브에 추가하는 워크플로.

## 핵심 규칙

`src/entities/participant/lib/seasons/` 에 `season-{기수}.json` 파일 하나만 추가하면 자동 반영된다. 별도 import 코드 수정 불필요.

## 파일 위치 및 네이밍

```
src/entities/participant/lib/seasons/season-{숫자}.json
```

예: `season-31.json`

## JSON 최상위 구조

```json
{
  "seasonNo": 31,
  "label": "31기 (부제)",
  "episodes": [
    { "ep": 250, "airDate": "2026-06-04" }
  ],
  "participants": []
}
```

## participants[] 필수 필드

| 필드 | 타입 | 비고 |
|------|------|------|
| `seasonNo` | `number` | 상위 seasonNo와 동일 |
| `gender` | `"M"` \| `"F"` | |
| `handle` | `string` | 출연자 호칭 (예: "영수") |
| `photo.src` | `string \| null` | 사진 없으면 `null` |
| `photo.alt` | `string` | `"나는 SOLO {기수}기 {handle}"` |
| `instagram` | `string \| null` | `@` 제외 username |
| `finalChoice` | `string \| null` | 상대방 handle 또는 `null` |
| `profile.birthYear` | `number \| null` | |
| `profile.job` | `string \| null` | |
| `profile.region` | `string \| null` | |
| `profile.traits` | `string[]` | |
| `profile.notableQuotes` | `string[]` | |
| `profile.issues` | `string[]` | |
| `sources` | `array` | `{ title, url, confidence: "high"\|"medium"\|"low" }` |

## 검증 및 확인

```bash
npm run build   # Zod 스키마 검증 포함 — 실패 시 에러 출력
```

빌드 성공 = 스키마 유효. 새 도메인 사진 사용 시 `next.config.ts`의 `images.remotePatterns` 추가 필요.

## 흔한 실수

- `seasonNo` 필드를 participants 배열 각 항목에 빠뜨리는 경우 → Zod 에러
- `airDate` 형식이 `YYYY-MM-DD`가 아닌 경우 → Zod 에러
- `instagram`에 `@` 포함하는 경우 → username만 입력
