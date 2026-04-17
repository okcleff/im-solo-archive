---
name: css-patterns
description: Use when applying UI styles, choosing between custom CSS classes, or building new components in this project. Covers custom component classes defined in globals.css and daisyUI usage patterns.
---

# CSS Patterns

`src/app/globals.css` `@layer components`에 정의된 커스텀 클래스 레퍼런스.

## 커스텀 클래스 요약

| 클래스 | 용도 | 대표 사용처 |
|--------|------|-------------|
| `glass-panel` | 유리 효과 패널 (blur + 반투명) | 홈 hero, archive status |
| `surface-card` | 기본 카드 (테두리 + 그림자) | ParticipantCard, 시즌 카드 |
| `section-title` | 소형 대문자 레이블 | 섹션 헤더 (`results`, `navigation`) |
| `soft-stat` | 통계 수치 박스 (라운드 + 테두리) | 좌측 패널 숫자 박스 |
| `detail-hero-shell` | 상세 페이지 hero 외곽 (도트 패턴) | `/season/.../[handle]` |
| `detail-hero-panel` | hero 우측 정보 패널 | `/season/.../[handle]` |
| `detail-hero-photo` | hero 좌측 사진 프레임 | `/season/.../[handle]` |
| `app-shell` | body 루트 레이아웃 | `layout.tsx` body |
| `scrollbar-hide` | 스크롤바 숨김 | SeasonTabs 수평 스크롤 |

## 테마

- 라이트: `bumblebee` (기본)
- 다크: `forest` (`prefers-color-scheme: dark` 자동 적용)
- `[data-theme='forest']` 셀렉터로 다크 오버라이드 작성

## daisyUI 주요 사용 패턴

```tsx
// 카드
<div className="surface-card card">
  <div className="card-body gap-4 p-5">...</div>
</div>

// 배지 (남성: info, 여성: error)
<span className="badge badge-info">남</span>
<span className="badge badge-error">여</span>

// 통계
<div className="stats stats-vertical sm:stats-horizontal">
  <div className="stat">
    <div className="stat-title">label</div>
    <div className="stat-value">42</div>
  </div>
</div>

// 버튼
<button className="btn btn-primary btn-sm">확인</button>
<button className="btn btn-ghost btn-sm">취소</button>
```

## 폰트 변수

```css
font-[var(--font-title)]   /* S-Core Dream — 제목, 숫자 강조 */
font-[var(--font-sans)]    /* SUIT Variable — 본문 */
```

## 색상 투명도 패턴

daisyUI 5는 `text-base-content/72` 처럼 슬래시 불투명도를 지원함:

```tsx
text-base-content/45   // 매우 연한 레이블
text-base-content/70   // 서브텍스트
text-base-content/78   // 보조 본문
```

## 애니메이션 클래스

| 클래스 | 효과 |
|--------|------|
| `animate-modal-overlay` | 모달 오버레이 페이드인 |
| `animate-modal-content` | 모달 팝업 슬라이드인 |
| `animate-float-in` | 카드 float-up 등장 |

카드 hover: `hover:-translate-y-1 hover:shadow-xl transition-all duration-300`
