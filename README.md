# 나는 SOLO 출연자 아카이브

> 나는 SOLO 역대 출연자 프로필을 한눈에 검색하고 비교하는 비공식 팬 아카이브

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

---

## 프로젝트 개요

SBS Plus 예능 **나는 SOLO**의 역대 출연자 정보를 수집·정리한 비공식 아카이브 웹 앱입니다.
기수별 출연자의 직업, 나이, 지역, 특징, 화제 멘트, 인스타그램을 검색하고 비교할 수 있습니다.

현재 **28기 · 29기 · 30기** 데이터 수록. 이후 기수는 데이터 추가로 자동 반영됩니다.

---

## 주요 기능

- **기수 탭** — 전 기수를 수평 스크롤 탭으로 전환, 기수가 늘어나도 자동 대응
- **성별 · 검색 필터** — 이름 / 직업 / 지역 / 특징 실시간 검색, URL 쿼리 동기화
- **출연자 카드 모달** — 클릭 시 모달로 상세 정보 확인 (ESC 닫기 · 포커스 트랩 · 스크롤 잠금)
- **개별 출연자 페이지** — SEO용 정적 페이지 (`/season/[기수]/[성별]/[이름]`)
- **인스타그램 링크** — 출연자 instagram 핸들 등록 시 카드·모달·상세 페이지에서 바로 이동
- **기수 드롭다운 네비게이션** — 헤더의 "기수별 ▾" 클릭으로 전 기수 바로가기
- **SEO 최적화** — JSON-LD(ItemList · Person), sitemap.xml, robots.txt, Open Graph 메타태그

---

## 기술 스택

| 분류       | 기술                         |
| ---------- | ---------------------------- |
| 프레임워크 | Next.js 15 (App Router, SSG) |
| 언어       | TypeScript 5                 |
| 스타일     | Tailwind CSS 3               |
| 배포       | Vercel                       |

---

## 아키텍처

**Feature-Slice Design(FSD)** 패턴을 기반으로 설계되었습니다.
레이어 구조 및 slice 설계는 개발자가 직접 설계하였으며, 각 레이어의 단방향 의존성 원칙을 준수합니다.

```
src/
├── app/          # Next.js 라우팅 (thin wrapper)
├── widgets/      # 복합 UI 블록 (SeasonNav, ParticipantModal, ClientHome)
├── features/     # 사용자 인터랙션 (SeasonTabs, FilterBar)
├── entities/     # 비즈니스 객체 (Participant, Season, ParticipantCard)
└── shared/       # 공통 유틸 (utils, JsonLd, site config)
```

각 slice는 `index.ts`로 public API를 노출하며, **상위 레이어만 하위 레이어를 참조**합니다.

---

## 개발 방식

이 프로젝트는 **바이브 코딩(Vibe Coding)** 방식으로 제작되었습니다.
AI 도구를 페어 프로그래밍 파트너로 활용하여 빠르게 프로토타입을 구현하고 반복 개선했습니다.

- **[Claude Code](https://claude.ai/claude-code)** — 코드 생성 및 리팩토링
- **[OpenAI Codex](https://openai.com/codex)** — 로직 보완 및 코드 검토
- **[Cursor](https://cursor.sh)** — AI 기반 IDE, 인라인 편집 및 컨텍스트 이해

> FSD 아키텍처 설계 및 전체 구조 의사결정은 개발자가 직접 수행하였으며,
> AI 도구는 설계된 구조 안에서 구현 속도를 높이는 보조 역할로 활용되었습니다.

---

## 시작하기

### 요구사항

- Node.js 18+
- npm 또는 yarn / pnpm

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/okcleff/im-solo-archive.git
cd im-solo-archive

# 패키지 설치
npm install

# 개발 서버 실행 (Turbopack)
npm run dev
# → http://localhost:3000
```

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 로컬 프로덕션 서버 실행
npm start
```

### 환경 변수

```bash
# .env.example을 복사하여 .env.local 생성
cp .env.example .env.local
```

| 변수명                 | 설명                                  | 기본값                               |
| ---------------------- | ------------------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_BASE_URL` | 배포 도메인 (sitemap · OG URL 생성용) | `https://im-solo-archive.vercel.app` |

---

## 데이터 관리

모든 출연자 데이터는 외부 API 없이 **로컬 상수**로 관리됩니다.

**파일 위치**: [`src/entities/participant/lib/data.ts`](src/entities/participant/lib/data.ts)

### 새 기수 추가

`SEASONS_DATA` 배열 맨 앞에 새 시즌 객체를 추가합니다 (최신순 정렬 유지).

```typescript
export const SEASONS_DATA: Season[] = [
  {
    seasonNo: 31, // 새 기수 번호
    label: "31기 (특집명)",
    episodes: [{ ep: 250, airDate: "2026-06-01" }],
    participants: [
      /* ... */
    ],
  },
  // 기존 시즌들...
];
```

### 인스타그램 추가

해당 출연자의 `instagram` 필드에 `@` 없이 username만 입력합니다.

```typescript
{
  handle: '영수',
  instagram: 'actual_instagram_handle',  // @ 제외
  // ...
}
```

---

## 배포

### Vercel (권장)

1. [vercel.com](https://vercel.com)에서 GitHub 저장소 연결
2. 환경 변수 `NEXT_PUBLIC_BASE_URL` 설정
3. 자동 배포

### 정적 내보내기 (GitHub Pages 등)

`next.config.ts`에서 `output: 'export'` 주석 해제 후 빌드:

```bash
npm run build
# out/ 폴더를 정적 호스팅 서버에 배포
```

---

## 라이선스

MIT License — 비공식 팬 프로젝트입니다.
출연자 관련 정보는 공개된 뉴스 기사를 출처로 하며, 저작권은 원 출처에 있습니다.
