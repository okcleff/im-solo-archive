# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 개발 서버 (Turbopack, localhost:3000)
npm run build    # 프로덕션 빌드 (Zod 스키마 검증 포함)
npm run lint     # ESLint
npm start        # 프로덕션 서버 실행
```

테스트 프레임워크 없음. 빌드 성공 여부가 주요 검증 수단이다.

## 아키텍처

**FSD(Feature-Sliced Design)** 구조. `src/` 아래 레이어 간 단방향 의존 규칙 준수:

```
app → widgets → features → entities → shared
```

- `app/` — 라우트, layout, sitemap, robots
- `widgets/` — 복합 UI (ClientHome, ParticipantModal, SeasonNav)
- `features/` — 사용자 액션 단위 (SeasonTabs, FilterBar)
- `entities/participant/` — 도메인 모델, 스키마, UI 컴포넌트, 데이터
- `shared/` — 순수 유틸, 전역 설정, 공용 UI

### 서버/클라이언트 경계

`entities/participant`는 두 진입점을 가진다:

- **`server.ts`** (`server-only`) — `SEASONS_DATA`, `LATEST_SEASON`, `SHOW_INFO`, selector 함수. 서버 컴포넌트에서만 import.
- **`index.ts`** — 타입, 유틸 함수, UI 컴포넌트. 어디서든 import 가능.

클라이언트 컴포넌트(`'use client'`)에서 `server.ts`를 직접 import하면 빌드 에러가 발생한다. 데이터를 props로 내려보내야 한다.

## 데이터 레이어

`src/entities/participant/lib/seasons/season-{기수}.json` 파일을 자동 수집해 `SeasonSchema`로 Zod 검증 후 최신순 정렬.

**새 기수 추가:** `/fill-season {기수번호}` 커스텀 커맨드 실행 → JSON 자동 생성. 별도 import 코드 불필요.

Zod 스키마 (`model/schemas.ts`)가 단일 진실 공급원. `z.infer<>` 기반 타입 추론.
- `Participant.profile`: `birthYear · job · region` 세 필드만 존재
- `Participant.sources`: `string[]` — 참조 URL 배열
- `Participant.instagram`: `@` 제외 username 또는 `null`

사진은 외부 호스팅. 새 도메인 사용 시 `next.config.ts`의 `images.remotePatterns` 추가 필요.

## 라우트 구조

```
/                               → 홈 (기수 탭 + 필터 + 카드 그리드)
/season/[seasonNo]              → 기수별 페이지
/season/[seasonNo]/[m|f]/[handle] → 출연자 상세
```

`handle`은 한글 텍스트(예: `영수`). Next.js가 URL 인코딩을 처리한다.
홈의 URL 상태: `?season=30&gender=F&q=검색어`

## 스타일 시스템

- **Tailwind CSS 4 + daisyUI 5**. 진입점: `src/app/globals.css`
- 테마: `bumblebee`(라이트), `forest`(다크). `data-theme` attribute로 전환.
- **커스텀 CSS 클래스** (`@layer components`에 정의):
  - `glass-panel` — 유리 효과 패널
  - `surface-card` — 카드 기본 스타일 (ParticipantCard 등)
  - `section-title` — 소형 대문자 섹션 레이블
  - `soft-stat` — 통계 수치 박스
- **폰트 변수**: `var(--font-sans)` (Noto Sans KR), `var(--font-title)` (Noto Serif KR), `var(--font-display)` (Playfair Display). 웹폰트는 Google Fonts CDN 로딩.
- 수동으로 `hover:-translate-y-1`류 애니메이션 패턴을 카드에 적용.

## 환경 변수

| 변수 | 용도 | 기본값 |
|------|------|--------|
| `NEXT_PUBLIC_BASE_URL` | canonical/sitemap/OG URL | `https://im-solo-archive.vercel.app` |

로컬 개발 시 `.env.local`에 설정.
