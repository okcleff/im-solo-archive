# 홈페이지 UX 개선 설계

## 배경

현재 홈페이지는 Hero → Archive Status → Season Rail → 필터 → 카드 그리드 순으로 섹션이 많아
첫 화면이 복잡하고 데이터가 흩어져 보인다는 문제가 있다. 주요 사용 시나리오는
특정 출연자 검색(A 우선)과 기수별 탐색(B 보조)이며, 홈 진입 시 "몇 기 볼래?" 느낌으로
기수 선택이 메인 액션이 되도록 재편한다.

---

## 변경 범위

### 1. 홈 페이지 구조 (`app/page.tsx`, `widgets/home-interactive/`)

**제거:**
- Hero 대형 배너 섹션
- Archive Status 섹션
- Season Rail 섹션

**변경 후 구조:**
```
헤더 (로고 · 테마 토글)
─────────────────────────────
타이틀 (한 줄, 작게)
"나는 SOLO 출연진 아카이브"
─────────────────────────────
기수 선택 칩 그리드           ← 메인 콘텐츠
[ 1 ][ 2 ][ 3 ] … [ 30 ]
5~6열 그리드, 현재 선택 기수 강조
─────────────────────────────
[전체] [남] [여]  🔍 검색
카드 그리드 (남 / 여 구분)
─────────────────────────────
Footer
```

- 기수 칩: 번호만 표시, 선택된 기수는 primary 색상 강조
- 기수 칩 그리드가 기존 SeasonTabs + Season Rail을 대체
- URL 상태 `?season=30&gender=F&q=검색어` 유지

---

### 2. 출연자 카드 (`entities/participant/ui/ParticipantCard.tsx`)

**제거:** 사진 영역 (4:5 플레이스홀더 포함) 완전 제거

**변경 후 레이아웃 (텍스트 중심):**
```
┌──────────────────────────┐
│  30기  [남]              │  ← 기수 + 성별 배지
│                          │
│  영수                    │  ← 이름 (크게)
│  패션브랜드 기획         │  ← 직업 (없으면 숨김)
│                          │
│  서울 중구 · 35세 (1992년생) │  ← 지역 · 나이 (없는 필드 숨김)
└──────────────────────────┘
```

- 나이와 출생연도 동시 표시: `35세 (1992년생)`
  - birthYear만 있으면: `(1992년생)`
  - 나이만 계산되면: `35세`
  - 둘 다 없으면: 해당 줄 숨김
- 카드 비율: 세로 직사각형 → 가로형 (약 3:1 비율)으로 변경
- 그리드: 모바일 1열, 태블릿 2열, 데스크톱 3~4열
- 호버 애니메이션 (`hover:-translate-y-1`) 유지
- 성별 색상 배지 및 하단 라인 유지

---

### 3. 출연자 상세 페이지 (`app/season/[seasonNo]/[gender]/[handle]/`)

**유지 이유:** 공유 가능한 URL, OG 미리보기, SEO

**변경 사항:**
- Hero 2단 레이아웃 (사진 카드 + 정보 패널) → 단일 컬럼으로 단순화 (이름, 직업, SEASON/AGE/REGION stat 박스, 인스타그램 링크 유지)
- 출처 섹션 상단에 초상권 안내 문구 추가:
  ```
  📷 출연자 사진은 초상권 보호를 위해 게재하지 않습니다.
     아래 출처 링크에서 확인하실 수 있습니다.
  ```
- 출처 URL 표시: URL 인코딩 디코딩 후 표시 (`decodeURIComponent`)

---

### 4. Footer (`app/layout.tsx`)

기존 문구에 한 줄 추가:
```
본 사이트는 공개된 뉴스 기사 기반의 비공식 팬 아카이브입니다.
출연자 사진은 초상권 보호를 위해 게재하지 않습니다.
문의: imsoloarchive@gmail.com
```

---

## 영향 범위

| 파일 | 변경 유형 |
|------|----------|
| `src/app/page.tsx` | 대규모 수정 (섹션 제거, 구조 재편) |
| `src/widgets/home-interactive/ClientHome.tsx` | 수정 (SeasonTabs → 칩 그리드 교체) |
| `src/features/season-select/SeasonTabs.tsx` | 칩 그리드 컴포넌트로 재작성 |
| `src/entities/participant/ui/ParticipantCard.tsx` | 수정 (사진 제거, 나이 표시 변경) |
| `src/app/season/[seasonNo]/[gender]/[handle]/page.tsx` | 수정 (레이아웃 단순화, 안내 문구) |
| `src/widgets/participant-modal/ParticipantDetailsSections.tsx` | 수정 (출처 URL 디코딩) |
| `src/app/layout.tsx` | 수정 (Footer 문구 추가) |
| `src/app/globals.css` | 수정 (카드 비율, 새 칩 스타일, `detail-hero-*` 클래스 정리) |

---

## 비고

- 사진 자동 수집은 저작권 이슈로 구현하지 않음
- `photo.src` 필드는 스키마에 유지 (향후 수동 입력 여지)
- 기존 SeasonNav 헤더 드롭다운은 유지 (보조 내비게이션)
