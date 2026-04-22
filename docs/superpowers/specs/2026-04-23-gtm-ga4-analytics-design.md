# GTM + GA4 Analytics Integration Design

**Date:** 2026-04-23  
**Branch:** feature/ga  
**Status:** Approved

## Overview

Google Tag Manager(GTM)를 통해 GA4 방문자 데이터 수집을 추가한다. 동의 배너 없이 운영하며, 기본 페이지뷰 + 주요 인터랙션 이벤트를 수집한다.

## Constraints

- 쿠키 동의 배너 없음 (소규모 팬 아카이브, 비상업적)
- GTM 컨테이너 ID: `GTM-W3SXJB7S` (환경 변수로 관리)
- GA4 측정 ID는 GTM 콘솔에서 연결 (코드 외부)

## Architecture

### 새 파일

```
src/shared/analytics/
  GoogleTagManager.tsx   — GTM <script> + <noscript> 서버 컴포넌트
  events.ts              — trackEvent() 유틸 + 이벤트별 함수
```

### 변경 파일

| 파일 | 변경 내용 |
|---|---|
| `src/app/layout.tsx` | `<head>` 최상단에 GTM script, `<body>` 첫 자식에 GTM noscript 삽입 |
| `src/features/season-select/SeasonTabs.tsx` | `season_tab_click` 이벤트 호출 |
| `src/entities/participant/ui/ParticipantCard.tsx` | `participant_card_click` 이벤트 호출 |
| `src/features/participant-filter/FilterBar.tsx` | `search_query` 이벤트 호출 (디바운스) |
| `.env.local` / `.env.example` | `NEXT_PUBLIC_GTM_ID` 추가 |

## GTM Script Integration

`layout.tsx`의 `<head>` 최상단에 GTM 스크립트 삽입. noscript는 `<body>` 첫 번째 자식으로 배치. `GoogleTagManager` 서버 컴포넌트로 분리해 layout에서 import.

## Custom Events

| 이벤트명 | 발생 위치 | 파라미터 |
|---|---|---|
| `season_tab_click` | SeasonTabs | `season_no: number` |
| `participant_card_click` | ParticipantCard | `season_no: number, name: string, gender: string` |
| `search_query` | FilterBar | `query: string` (300ms 디바운스 후 전송) |

`events.ts`에 타입 안전한 `trackEvent()` 래퍼 함수를 두고, 각 이벤트별 함수(`trackSeasonTabClick` 등)를 export한다. `window.dataLayer`는 클라이언트에서만 접근 가능하므로 `typeof window !== 'undefined'` 가드 적용.

## Environment Variables

```
NEXT_PUBLIC_GTM_ID=GTM-W3SXJB7S
```

`.env.local`에 추가. `.env.example`(또는 README)에도 키 이름 문서화.

## Post-Deploy GTM Console Setup

코드 배포 후 GTM 콘솔에서 직접 진행:

1. **GA4 구성 태그** — 태그 유형: "Google 애널리틱스: GA4 구성" → GA4 측정 ID 입력 → 트리거: All Pages
2. **커스텀 이벤트 태그** — `season_tab_click`, `participant_card_click`, `search_query` 각각 GA4 이벤트 태그 + 트리거 생성
3. **컨테이너 게시**

GA4 속성은 GTM 태그 설정 시 신규 생성하거나 기존 계정 연결.

## Out of Scope

- 쿠키 동의 배너
- 출연자 상세 페이지 체류 시간, 스크롤 깊이 등 심화 이벤트
- 서버사이드 이벤트 트래킹
