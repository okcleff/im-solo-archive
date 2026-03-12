# 나는 SOLO 출연자 아카이브

> 나는 SOLO 역대 출연자 프로필을 검색하고 비교하는 비공식 팬 아카이브

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![daisyUI](https://img.shields.io/badge/daisyUI-5-1AD1A5)](https://daisyui.com)

---

## 프로젝트 개요

SBS Plus 예능 **나는 SOLO**의 기수별 출연자 데이터를 정리하여 보여주기 위한 목적으로, 바이브 코딩으로 제작한 웹 앱입니다.
직업, 나이, 지역, 특징, 화제 멘트, 출처, 인스타그램 정보를 한 곳에서 탐색할 수 있습니다.

- 현재 수록 범위: **20기 ~ 30기**
- 현재는 **20기 ~ 30기까지만 데이터 수집이 완료된 상태**이며, 이후 기수 데이터도 순차적으로 업데이트할 예정입니다.
- 데이터 소스: `src/entities/participant/lib/seasons/season-*.json`
- 신규 기수 반영: JSON 파일 추가 시 자동 로딩 + Zod 검증

---

## 주요 기능

- **기수 탐색**: 상단 탭/드롭다운으로 기수 빠른 이동
- **검색 고도화**: 전체 기수 대상 검색, `기수 + 키워드` 조합 검색 지원
- **검색 실행 방식**: `Enter` 또는 돋보기 버튼 클릭 시 검색 실행
- **성별 필터**: `전체/남/여` 필터링
- **시즌 레일 + 보드형 탐색 UI**: 시즌 타일 레일, 좌측 요약 패널, 균일 카드 그리드 기반 탐색
- **출연자 카드 & 모달**: 카드 클릭 시 상세 모달 제공 (ESC 닫기, 포커스 트랩, 스크롤 잠금)
- **개별 상세 페이지**: `/season/[seasonNo]/[gender]/[handle]` 상세 프로필 페이지 제공
- **테마 시스템**: daisyUI `bumblebee`(light), `forest`(dark) + 시스템 테마 연동 + 수동 토글 + 쿠키/로컬스토리지 동기화로 초기 플래시 최소화
- **SEO**: JSON-LD(ItemList, Person), `sitemap.xml`, `robots.txt`, OG 메타

---

## 기술 스택

| 분류        | 기술                                  |
| ----------- | ------------------------------------- |
| 프레임워크  | Next.js 16 (App Router)               |
| UI          | React 19                              |
| 언어        | TypeScript 5                          |
| 스타일      | Tailwind CSS 4.2 + daisyUI 5          |
| 스키마/타입 | Zod 4 (`z.infer` 기반 타입 추론)      |
| 데이터 로딩 | Node.js `fs` + server-only public API |
| 테마 저장   | `localStorage` + `theme` 쿠키         |

---

## 아키텍처

프로젝트는 **FSD(Feature-Sliced Design)** 구조를 따릅니다.

```text
src/
├── app/          # 라우트/페이지/layout
├── widgets/      # 복합 UI (홈 인터랙션, 모달, 시즌 네비)
├── features/     # 사용자 액션 단위 기능 (검색/필터/탭)
├── entities/     # 도메인 모델, 스키마, 카드 UI, 데이터
└── shared/       # 공용 유틸/UI/설정
```

### UI/테마 구조

- 전역 스타일 진입점: `src/app/globals.css`
- daisyUI 테마: `bumblebee`(기본), `forest`(다크)
- 테마 적용 방식:
  서버는 `theme` 쿠키를 읽어 첫 HTML에 테마를 반영하고,
  클라이언트는 `localStorage`와 쿠키를 함께 갱신합니다.
- 주요 UI 패턴:
  `card`, `badge`, `stats`, `btn`, `input`, `dropdown`, `modal`, `alert` 등 daisyUI 컴포넌트를 기본 사용

---

## 시작하기

### 요구사항

- Node.js 18+
- npm

### 설치 및 실행

```bash
git clone https://github.com/okcleff/im-solo-archive.git
cd im-solo-archive
npm install
npm run dev
```

개발 서버: `http://localhost:3000`

### 빌드/실행

```bash
npm run build
npm start
```

프로덕션 모드에서 테마 초기 렌더 동작을 확인하려면 `npm run build && npm start` 기준으로 점검하는 것이 좋습니다.

### 주요 스크립트

```bash
npm run dev     # 개발 서버 (Turbopack)
npm run build   # 프로덕션 빌드
npm run start   # 프로덕션 서버 실행
npm run lint    # 린트
```

---

## 환경 변수

`.env.example`를 복사해 `.env.local`을 생성해 사용합니다.

```bash
cp .env.example .env.local
```

| 변수명                 | 설명                                      | 기본값                               |
| ---------------------- | ----------------------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_BASE_URL` | canonical/sitemap/OG URL 생성 기준 도메인 | `https://im-solo-archive.vercel.app` |

---

## 데이터 관리

### 시즌 파일 규칙

- 경로: `src/entities/participant/lib/seasons/`
- 파일명: `season-{숫자}.json`
- 현재 저장소에는 **20기 ~ 30기 데이터만 포함**되어 있으며, 이후 시즌은 추후 수집 후 반영 예정입니다.

`src/entities/participant/lib/data.ts`가 `season-*.json`을 자동으로 읽어 최신순으로 정렬합니다.
각 파일은 `SeasonSchema`로 검증되며 실패 시 빌드에서 에러가 발생합니다.
서버 컴포넌트에서는 `src/entities/participant/server.ts`를 통해 데이터를 참조합니다.

### 새 기수 추가

1. `src/entities/participant/lib/seasons/season-{기수}.json` 파일 추가
2. `npm run build`로 스키마 검증 확인

별도의 import 코드 추가는 필요 없습니다.

### JSON 필드 설명

#### 최상위

| 필드                 | 타입     | 설명                                              |
| -------------------- | -------- | ------------------------------------------------- |
| `seasonNo`           | `number` | 기수 번호 (예: `30`)                              |
| `label`              | `string` | 기수 표시 레이블 (예: `"30기 (에겐남 & 테토녀)"`) |
| `episodes`           | `array`  | 방영 회차 목록                                    |
| `episodes[].ep`      | `number` | 방영 회차 번호                                    |
| `episodes[].airDate` | `string` | 방영일 (`YYYY-MM-DD`)                             |
| `participants`       | `array`  | 출연자 목록                                       |

#### participants[]

| 필드          | 타입             | 설명                                                            |
| ------------- | ---------------- | --------------------------------------------------------------- |
| `seasonNo`    | `number`         | 소속 기수 번호                                                  |
| `gender`      | `"M" \| "F"`     | 성별 (`M`: 남성, `F`: 여성)                                     |
| `handle`      | `string`         | 출연자 호칭 (예: `"영수"`, `"옥순"`)                            |
| `photo.src`   | `string \| null` | 프로필 사진 경로 또는 URL (`null` 허용)                         |
| `photo.alt`   | `string`         | 이미지 alt 텍스트                                               |
| `instagram`   | `string \| null` | 인스타그램 사용자명, `@` 제외 (예: `"username"`, 없으면 `null`) |
| `finalChoice` | `string \| null` | 최종 선택 상대방 handle (`null`: 미선택 또는 미공개)            |

#### participants[].profile

| 필드            | 타입             | 설명                   |
| --------------- | ---------------- | ---------------------- |
| `birthYear`     | `number \| null` | 출생 연도 (예: `1992`) |
| `job`           | `string \| null` | 직업/직책              |
| `region`        | `string \| null` | 거주 지역              |
| `traits`        | `string[]`       | 특징/키워드 목록       |
| `notableQuotes` | `string[]`       | 화제 멘트 목록         |
| `issues`        | `string[]`       | 방영 중 이슈/논란 목록 |

#### participants[].sources[]

| 필드         | 타입                          | 설명                                                                     |
| ------------ | ----------------------------- | ------------------------------------------------------------------------ |
| `title`      | `string`                      | 출처 기사/콘텐츠 제목                                                    |
| `url`        | `string`                      | 출처 URL                                                                 |
| `confidence` | `"high" \| "medium" \| "low"` | 정보 신뢰도 (`high`: 공식/신뢰 매체, `medium`: 추정 가능, `low`: 불확실) |

---

## 배포

### Vercel (권장)

1. 저장소 연결
2. `NEXT_PUBLIC_BASE_URL` 설정
3. 배포

참고:

- 테마 쿠키를 읽기 때문에 루트 레이아웃은 동적 렌더 경로를 사용합니다.
- 시즌 데이터 자체는 파일 기반으로 유지되며 상세 경로는 Next.js에서 요청 시 렌더링합니다.

---

## 라이선스

MIT License
