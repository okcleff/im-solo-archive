# 데이터 수집 자동화 설계

**날짜:** 2026-04-17  
**상태:** 승인됨

## 배경

현재 시즌 JSON 파일은 수작업으로 웹 검색 후 직접 입력하는 방식으로 관리된다. 이를 Claude Code 커스텀 커맨드 + WebSearch 기반 자동 수집으로 대체한다.

---

## 1단계 범위 (즉시 구현)

### 스키마 변경

`src/entities/participant/model/schemas.ts`

**제거:**
- `profile.traits: string[]`
- `profile.notableQuotes: string[]`
- `profile.issues: string[]`
- `SourceSchema` (title, url, confidence 구조체)
- `ConfidenceSchema`

**변경:**
- `sources: Source[]` → `sources: z.array(z.string().url())`

**변경 후 ProfileSchema:**
```ts
ProfileSchema = z.object({
  birthYear: z.number().int().nullable(),
  job:       z.string().nullable(),
  region:    z.string().nullable(),
});
```

**변경 후 ParticipantSchema 관련:**
```ts
sources:     z.array(z.string().url()),
finalChoice: z.string().nullable(),
```

### 기존 데이터 처리

`src/entities/participant/lib/seasons/` 내 모든 JSON 파일 삭제. 신규 스키마 기준으로 `/fill-season` 커맨드로 재수집.

### `/fill-season` 커스텀 커맨드

**파일:** `.claude/commands/fill-season.md`  
**실행:** `/fill-season {기수번호}` (예: `/fill-season 31`)

**동작 흐름:**
1. `{기수}기 나는SOLO 출연자` 웹 검색 → 출연자 목록(이름 + 성별) 파악
2. 출연자별 직업·지역·출생연도 추가 검색 (블로그, 뉴스 기사)
3. `finalChoice` — 방송 결말 기사 검색해서 채움
4. 수집 출처 URL을 `sources: string[]`에 기록
5. `src/entities/participant/lib/seasons/season-{기수}.json` 생성
6. 완료 후 `null` 필드 목록 요약 출력

**원칙:**
- 출처 없이 필드를 채우지 않는다 — 못 찾으면 `null`
- `sources`에는 실제로 참조한 URL만 기록
- `photo.src`는 항상 `null` (사진은 별도 작업)

### fill-season이 수집하는 시즌 전체 구조

출연자 외에 시즌 최상위 필드도 수집:
- `label` — 기수 부제 (예: `"31기 (부제)"`)
- `episodes` — 방영 회차 목록 (ep 번호 + airDate `YYYY-MM-DD`)

### UI 영향 (스키마 변경에 따른 정리)

- `ParticipantCard`: `traitPreview` 렌더링 블록 제거
- `ParticipantDetailsSections`: `traits`, `notableQuotes`, `issues`, `SourceConfidenceLegend` 렌더링 제거
- `SourceConfidenceLegend` 컴포넌트 삭제
- `sources` 렌더링: URL 배열을 링크 목록으로 단순 출력
- `filterParticipants.ts`: searchable 문자열에서 `traits`, `notableQuotes` 제거
- `helpers.ts`: `getParticipantSummary`의 `traits` 폴백 → `'정보 미공개'`로 교체

---

## 2단계 범위 (추후 구현)

### finalChoice 스포일러 토글

- 기본값: 숨김
- 토글 ON 시 ParticipantCard, 모달, 상세 페이지에 최종선택 표시
- 상태는 `localStorage` 저장
- UI 위치 및 디자인은 추후 결정

---

## 영향 파일 목록

| 파일 | 변경 유형 |
|------|-----------|
| `src/entities/participant/model/schemas.ts` | 스키마 수정 |
| `src/entities/participant/lib/seasons/*.json` | 전체 삭제 |
| `src/entities/participant/ui/ParticipantCard.tsx` | traitPreview 블록 제거 |
| `src/entities/participant/ui/ParticipantDetailsSections.tsx` | traits/quotes/issues/출처 렌더링 제거 |
| `src/entities/participant/ui/SourceConfidenceLegend.tsx` | 삭제 |
| `src/entities/participant/index.ts` | SourceConfidenceLegend export 제거 |
| `src/entities/participant/lib/helpers.ts` | getParticipantSummary traits 폴백 제거 |
| `src/features/participant-filter/lib/filterParticipants.ts` | searchable에서 traits/notableQuotes 제거 |
| `.claude/commands/fill-season.md` | 신규 생성 |
