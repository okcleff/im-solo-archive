# GTM + GA4 Analytics Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GTM 스크립트를 삽입하고 기수 탭 클릭, 출연자 카드 클릭, 검색어 입력 커스텀 이벤트를 GA4로 수집한다.

**Architecture:** `src/shared/analytics/`에 GTM 컴포넌트와 이벤트 유틸을 만들고, `layout.tsx`에 스크립트를 삽입한다. 각 UI 컴포넌트에서 이벤트 함수를 호출하고 `window.dataLayer`로 push한다. GA4 연결은 GTM 콘솔에서 별도로 구성한다.

**Tech Stack:** Next.js 16 App Router, `next/script`, TypeScript, GTM-W3SXJB7S

---

## File Map

| 상태 | 파일 | 역할 |
|---|---|---|
| Create | `src/shared/analytics/GoogleTagManager.tsx` | GTM `<Script>` + `<noscript>` 렌더링 |
| Create | `src/shared/analytics/events.ts` | `trackEvent()` 래퍼 + 이벤트별 함수 |
| Modify | `src/app/layout.tsx` | GTM 스크립트 + noscript 삽입 |
| Modify | `src/features/season-select/ui/SeasonTabs.tsx` | `season_tab_click` 이벤트 추가 |
| Modify | `src/entities/participant/ui/ParticipantCard.tsx` | `participant_card_click` 이벤트 추가 |
| Modify | `src/features/participant-filter/ui/FilterBar.tsx` | `search_query` 이벤트 추가 |
| Modify | `.env.example` | `NEXT_PUBLIC_GTM_ID` 키 문서화 |
| Modify | `.env.local` | `NEXT_PUBLIC_GTM_ID=GTM-W3SXJB7S` 추가 |

---

## Task 1: 환경 변수 설정

**Files:**
- Modify: `.env.example`
- Modify: `.env.local`

- [ ] **Step 1: `.env.example`에 GTM_ID 키 추가**

`NEXT_PUBLIC_BASE_URL` 줄 아래에 추가:

```
# Google Tag Manager 컨테이너 ID
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

- [ ] **Step 2: `.env.local`에 실제 GTM_ID 추가**

기존 파일 끝에 추가:

```
NEXT_PUBLIC_GTM_ID=GTM-W3SXJB7S
```

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: add NEXT_PUBLIC_GTM_ID env variable"
```

(`.env.local`은 `.gitignore`에 포함되므로 커밋하지 않음)

---

## Task 2: GoogleTagManager 컴포넌트 생성

**Files:**
- Create: `src/shared/analytics/GoogleTagManager.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
// src/shared/analytics/GoogleTagManager.tsx
import Script from "next/script";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export function GoogleTagManagerScript() {
  if (!GTM_ID) return null;
  return (
    <Script
      id="gtm"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
      }}
    />
  );
}

export function GoogleTagManagerNoScript() {
  if (!GTM_ID) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
```

- [ ] **Step 2: `layout.tsx`에 삽입**

`layout.tsx` 상단 import에 추가:
```tsx
import {
  GoogleTagManagerScript,
  GoogleTagManagerNoScript,
} from "@/shared/analytics/GoogleTagManager";
```

`<html>` 반환부에서:
- `<head>` 닫는 태그 바로 위에 `<GoogleTagManagerScript />` 추가
- `<body>` 여는 태그 바로 다음 첫 번째 자식으로 `<GoogleTagManagerNoScript />` 추가

변경 전:
```tsx
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
```

변경 후:
```tsx
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
```

(head 내부는 그대로, 아래 `</head>` 위에 추가)

`</head>` 직전:
```tsx
        <GoogleTagManagerScript />
      </head>
      <body className="app-shell font-(--font-sans)">
        <GoogleTagManagerNoScript />
        <ThemeProvider>
```

- [ ] **Step 3: 빌드 검증**

```bash
npm run build
```

Expected: 빌드 성공, 에러 없음

- [ ] **Step 4: Commit**

```bash
git add src/shared/analytics/GoogleTagManager.tsx src/app/layout.tsx
git commit -m "feat: add GTM script to layout"
```

---

## Task 3: events.ts 유틸 생성

**Files:**
- Create: `src/shared/analytics/events.ts`

- [ ] **Step 1: 파일 생성**

```ts
// src/shared/analytics/events.ts

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

export function trackSeasonTabClick(seasonNo: number) {
  trackEvent("season_tab_click", { season_no: seasonNo });
}

export function trackParticipantCardClick(
  seasonNo: number,
  name: string,
  gender: string
) {
  trackEvent("participant_card_click", { season_no: seasonNo, name, gender });
}

export function trackSearchQuery(query: string) {
  if (!query.trim()) return;
  trackEvent("search_query", { query });
}
```

- [ ] **Step 2: 빌드 검증**

```bash
npm run build
```

Expected: 빌드 성공, TypeScript 에러 없음

- [ ] **Step 3: Commit**

```bash
git add src/shared/analytics/events.ts
git commit -m "feat: add analytics event tracking utilities"
```

---

## Task 4: SeasonTabs에 season_tab_click 추가

**Files:**
- Modify: `src/features/season-select/ui/SeasonTabs.tsx`

- [ ] **Step 1: import 추가**

파일 상단에 추가:
```tsx
import { trackSeasonTabClick } from "@/shared/analytics/events";
```

- [ ] **Step 2: 탭 버튼 onClick에 이벤트 추가**

변경 전:
```tsx
onClick={() => onChange(s.seasonNo)}
```

변경 후:
```tsx
onClick={() => {
  onChange(s.seasonNo);
  trackSeasonTabClick(s.seasonNo);
}}
```

- [ ] **Step 3: 빌드 검증**

```bash
npm run build
```

Expected: 빌드 성공

- [ ] **Step 4: Commit**

```bash
git add src/features/season-select/ui/SeasonTabs.tsx
git commit -m "feat: track season tab click event"
```

---

## Task 5: ParticipantCard에 participant_card_click 추가

**Files:**
- Modify: `src/entities/participant/ui/ParticipantCard.tsx`

- [ ] **Step 1: import 추가**

파일 상단에 추가:
```tsx
import { trackParticipantCardClick } from "@/shared/analytics/events";
```

- [ ] **Step 2: asLink 케이스 Link에 onClick 추가**

변경 전:
```tsx
      <Link href={href} className="block">
```

변경 후:
```tsx
      <Link
        href={href}
        className="block"
        onClick={() => trackParticipantCardClick(p.seasonNo, p.handle, p.gender)}
      >
```

- [ ] **Step 3: button 케이스 div onClick에 이벤트 추가**

변경 전:
```tsx
        onClick={onClick}
```

변경 후:
```tsx
        onClick={() => {
          trackParticipantCardClick(p.seasonNo, p.handle, p.gender);
          onClick?.();
        }}
```

- [ ] **Step 4: 빌드 검증**

```bash
npm run build
```

Expected: 빌드 성공

- [ ] **Step 5: Commit**

```bash
git add src/entities/participant/ui/ParticipantCard.tsx
git commit -m "feat: track participant card click event"
```

---

## Task 6: FilterBar에 search_query 추가

**Files:**
- Modify: `src/features/participant-filter/ui/FilterBar.tsx`

- [ ] **Step 1: import 추가**

파일 상단에 추가:
```tsx
import { trackSearchQuery } from "@/shared/analytics/events";
```

- [ ] **Step 2: submitQuery에 이벤트 추가**

변경 전:
```tsx
  const submitQuery = () => {
    onQueryChange(localQuery.trim());
  };
```

변경 후:
```tsx
  const submitQuery = () => {
    const trimmed = localQuery.trim();
    onQueryChange(trimmed);
    trackSearchQuery(trimmed);
  };
```

- [ ] **Step 3: 빌드 검증**

```bash
npm run build
```

Expected: 빌드 성공

- [ ] **Step 4: Commit**

```bash
git add src/features/participant-filter/ui/FilterBar.tsx
git commit -m "feat: track search query event"
```

---

## 배포 후 GTM 콘솔 설정 (수동)

코드 배포 후 [tagmanager.google.com](https://tagmanager.google.com)에서 진행:

1. **GA4 속성 생성** (없는 경우): [analytics.google.com](https://analytics.google.com) → 관리 → 속성 만들기 → 측정 ID(G-XXXXXXXXXX) 확인
2. **GA4 구성 태그 생성**: 태그 → 새 태그 → "Google 애널리틱스: GA4 구성" → 측정 ID 입력 → 트리거: All Pages → 저장
3. **커스텀 이벤트 태그 3개 생성**: 각각 아래 설정으로 태그 추가
   - 태그 유형: "Google 애널리틱스: GA4 이벤트"
   - 구성 태그: 위에서 만든 GA4 구성 태그
   - 이벤트 이름: `season_tab_click` / `participant_card_click` / `search_query`
   - 트리거: 맞춤 이벤트 → 이벤트 이름 동일하게 입력
4. **컨테이너 게시**: 제출 → 게시
