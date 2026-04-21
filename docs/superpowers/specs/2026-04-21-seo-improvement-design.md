# SEO 개선 Implementation Design

**Goal:** 구글 검색 랭킹 향상(롱테일 키워드)과 소셜 공유 미리보기 개선을 동시에 달성한다.

**Architecture:** 세 가지 변경으로 구성된다. (1) 전 페이지에 정적 OG 이미지 연결, (2) Participant 스키마에 `bio` 필드 추가 및 참가자 페이지에 표시·메타데이터 통합, (3) `fill-season` 커맨드에 bio 자동 수집 단계 추가.

**Tech Stack:** Next.js 16 App Router, Zod v4, TypeScript, Claude Code custom commands

---

## 섹션 1: 스키마 & 데이터 레이어

### 변경 파일
- Modify: `src/entities/participant/model/schemas.ts`
- Modify: `src/entities/participant/lib/seasons/season-*.json` (전체 30개)

### 스키마 변경
`ParticipantSchema`에 `bio` 필드 추가:

```ts
bio: z.string().nullable(),
```

### 기존 JSON 마이그레이션
30개 시즌 JSON 파일 모두 각 participant 객체에 `"bio": null` 추가. 필드 위치는 `sources` 다음.

---

## 섹션 2: OG 이미지 (전 페이지 정적 적용)

### 변경 파일
- Modify: `src/app/layout.tsx`

### 변경 내용
`metadata` 객체에 이미지 설정 추가:

```ts
openGraph: {
  // 기존 필드 유지
  images: [{ url: '/images/im-solo-offical-banner.jpg' }],
},
twitter: {
  card: 'summary_large_image',
  images: ['/images/im-solo-offical-banner.jpg'],
},
```

Next.js 메타데이터 상속 방식에 의해 개별 페이지가 `images`를 재정의하지 않으면 layout 기본값이 그대로 상속된다. 현재 모든 페이지는 `images`를 지정하지 않으므로 추가 수정 없이 전 페이지에 적용된다.

이미지 파일 위치: `public/images/im-solo-offical-banner.jpg` (이미 존재)

---

## 섹션 3: 참가자 페이지 — bio 표시 & 메타데이터 통합

### 변경 파일
- Modify: `src/app/season/[seasonNo]/[gender]/[handle]/page.tsx`

### 메타데이터 변경
`generateMetadata`에서 bio 우선 사용:

```ts
const description = participant.bio
  ? participant.bio.slice(0, 157) + (participant.bio.length > 157 ? '...' : '')
  : `나는 SOLO ${participant.seasonNo}기 ${participant.handle} — ${participant.profile.job ?? '출연자'} 프로필`

return {
  description,
  openGraph: { description, ... },
}
```

bio가 없으면 기존 공식 문장 유지.

### 페이지 내 표시
bio가 non-null일 때만 렌더링. 위치는 기본 프로필 정보 섹션 아래. 기존 `soft-stat` / `glass-panel` 카드 스타일 패턴 따름.

```tsx
{participant.bio && (
  <section className="...">
    <h2 className="section-title">방송 하이라이트</h2>
    <p className="text-base-content/80 leading-relaxed">{participant.bio}</p>
  </section>
)}
```

---

## 섹션 4: `fill-season` 커맨드 업데이트

### 변경 파일
- Modify: `.claude/commands/fill-season.md`

### 추가 단계: bio 수집

기존 출연자별 개인정보 수집(2단계) 이후에 bio 수집 단계를 추가한다.

**검색 전략:**
- `"나는솔로 [기수] [handle] 이슈"`
- `"나는솔로 [기수] [handle] 명언"`
- `"나는솔로 [기수] [handle] 하이라이트"`

**수집 기준:**
- 방송 중 실제 발생한 화제 행동·멘트·에피소드 위주
- 출처 확인된 내용만 수록
- 2~4문장, 한국어 서술체
- 사생활·추측성 내용 제외
- 찾지 못하면 반드시 `null` (출처 없이 채우지 않는 원칙 준수)

**완료 요약 형식 추가:**
```
⚠️ null 필드 목록:
- 영수: bio
- 옥순: bio, instagram
```

---

## 적용 범위 및 제외 사항

- **기수 페이지(`/season/[N]`)**: 이번 범위에서 제외. 텍스트 콘텐츠 추가는 향후 별도 작업.
- **BreadcrumbList, SearchAction 스키마**: 이번 범위 제외.
- **bio 소급 수집**: `fill-season` 커맨드 업데이트 후 기존 기수(1~30기)에 대해 별도로 실행해야 함 (자동 적용되지 않음).
