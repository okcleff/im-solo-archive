# SEO 개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 정적 OG 이미지 연결로 소셜 공유 미리보기를 개선하고, 참가자 페이지에 `bio` 필드를 추가해 방송 하이라이트 텍스트를 크롤 가능하게 노출한다.

**Architecture:** 4개 태스크로 구성된다. (1) Zod 스키마에 `bio` 필드 추가, (2) `layout.tsx`에 전역 OG 이미지 연결, (3) 참가자 상세 페이지의 메타데이터 + UI 업데이트, (4) `fill-season` 커맨드에 bio 수집 단계 추가. 테스트 프레임워크 없음 — 빌드 성공이 검증 수단이다.

**Tech Stack:** Next.js 16 App Router, Zod v4, TypeScript

---

## File Map

| 파일 | 변경 유형 | 역할 |
|------|-----------|------|
| `src/entities/participant/model/schemas.ts` | Modify | `bio` 필드 추가 |
| `src/app/layout.tsx` | Modify | 전역 OG/Twitter 이미지 추가 |
| `src/app/season/[seasonNo]/[gender]/[handle]/page.tsx` | Modify | bio 메타데이터 + UI 렌더링 |
| `.claude/commands/fill-season.md` | Modify | bio 수집 단계 + JSON 템플릿 추가 |

---

## Task 1: Zod 스키마에 `bio` 필드 추가

**Files:**
- Modify: `src/entities/participant/model/schemas.ts:16-25`

현재 `ParticipantSchema`에 `bio` 필드가 없다. `z.string().nullable().default(null)`로 추가하면 기존 30개 JSON 파일을 수정하지 않아도 된다 — 필드가 없으면 `null`로 기본값 처리된다.

- [ ] **Step 1: `bio` 필드를 `ParticipantSchema`에 추가**

`src/entities/participant/model/schemas.ts`의 `ParticipantSchema`를 다음으로 교체한다:

```ts
export const ParticipantSchema = z.object({
  seasonNo: z.number().int().positive(),
  gender: GenderSchema,
  handle: z.string().min(1),
  photo: PhotoSchema,
  instagram: z.string().nullable(),
  profile: ProfileSchema,
  sources: z.array(z.string().url()),
  bio: z.string().nullable().default(null),
  finalChoice: z.string().nullable(),
});
```

- [ ] **Step 2: 빌드로 검증**

```bash
npm run build
```

예상 출력 (마지막 줄):
```
✓ Generating static pages (402/402)
```

에러 없이 빌드가 완료되면 통과.

- [ ] **Step 3: 커밋**

```bash
git add src/entities/participant/model/schemas.ts
git commit -m "feat: add bio field to ParticipantSchema with null default"
```

---

## Task 2: 전역 OG 이미지 연결

**Files:**
- Modify: `src/app/layout.tsx:38-44`

`public/images/im-solo-offical-banner.jpg`가 이미 존재한다. `layout.tsx`의 `metadata` 객체에 이미지를 추가하면 Next.js 상속 방식에 의해 모든 페이지에 적용된다 — 개별 페이지가 `openGraph.images`를 재정의하지 않기 때문이다.

- [ ] **Step 1: `layout.tsx`의 `metadata`에 OG/Twitter 이미지 추가**

`src/app/layout.tsx`에서 현재 `openGraph`와 `twitter` 블록을:

```ts
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
  },
  twitter: { card: "summary_large_image" },
```

다음으로 교체한다:

```ts
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
    images: [{ url: "/images/im-solo-offical-banner.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/im-solo-offical-banner.jpg"],
  },
```

- [ ] **Step 2: 빌드로 검증**

```bash
npm run build
```

예상 출력:
```
✓ Generating static pages (402/402)
```

- [ ] **Step 3: 커밋**

```bash
git add src/app/layout.tsx
git commit -m "feat: add static OG image to all pages via layout metadata"
```

---

## Task 3: 참가자 페이지 — bio 메타데이터 + UI

**Files:**
- Modify: `src/app/season/[seasonNo]/[gender]/[handle]/page.tsx:34-57` (generateMetadata)
- Modify: `src/app/season/[seasonNo]/[gender]/[handle]/page.tsx:184-196` (JSX)

`generateMetadata`에서 bio가 있으면 설명으로 우선 사용하고, 페이지 하단에 "방송 하이라이트" 섹션을 조건부 렌더링한다.

- [ ] **Step 1: `generateMetadata`에서 bio 우선 사용**

`src/app/season/[seasonNo]/[gender]/[handle]/page.tsx`에서 현재 `description` 생성 라인:

```ts
  const description = `나는 SOLO ${p.seasonNo}기 ${p.gender === "M" ? "남" : "여"} 출연자 ${p.handle}. ${age !== "미공개" ? `${age} · ` : ""}${summary}`;
```

다음으로 교체한다:

```ts
  const fallbackDescription = `나는 SOLO ${p.seasonNo}기 ${p.gender === "M" ? "남" : "여"} 출연자 ${p.handle}. ${age !== "미공개" ? `${age} · ` : ""}${summary}`;
  const description = p.bio
    ? p.bio.slice(0, 157) + (p.bio.length > 157 ? "..." : "")
    : fallbackDescription;
```

`return` 블록은 변경 없음 — `description` 변수를 그대로 사용한다.

- [ ] **Step 2: bio 표시 섹션을 JSX에 추가**

같은 파일에서 현재 cards 컨테이너:

```tsx
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        <section className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body p-5 sm:p-6">
            <h2 className="text-base font-semibold mb-4">기본 정보</h2>
            <ParticipantDetailsSections
              participant={p}
              age={age}
              finalChoiceParticipant={finalChoiceParticipant}
              showGender
            />
          </div>
        </section>
      </div>
```

다음으로 교체한다:

```tsx
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        <section className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body p-5 sm:p-6">
            <h2 className="text-base font-semibold mb-4">기본 정보</h2>
            <ParticipantDetailsSections
              participant={p}
              age={age}
              finalChoiceParticipant={finalChoiceParticipant}
              showGender
            />
          </div>
        </section>

        {p.bio && (
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body p-5 sm:p-6">
              <h2 className="text-base font-semibold mb-4">방송 하이라이트</h2>
              <p className="text-base-content/80 leading-relaxed text-sm">
                {p.bio}
              </p>
            </div>
          </section>
        )}
      </div>
```

- [ ] **Step 3: 빌드로 검증**

```bash
npm run build
```

예상 출력:
```
✓ Generating static pages (402/402)
```

- [ ] **Step 4: 커밋**

```bash
git add src/app/season/[seasonNo]/[gender]/[handle]/page.tsx
git commit -m "feat: use bio as OG description and render highlight section on participant page"
```

---

## Task 4: `fill-season` 커맨드에 bio 수집 단계 추가

**Files:**
- Modify: `.claude/commands/fill-season.md`

기존 2단계(출연자별 개인정보 수집) 뒤에 bio 수집 단계를 추가하고, JSON 템플릿에 `"bio": null`을 포함시킨다.

- [ ] **Step 1: `fill-season.md` 전체를 다음 내용으로 교체**

`.claude/commands/fill-season.md`를 아래 내용으로 교체한다:

````markdown
나는 SOLO **$ARGUMENTS**기 출연자 데이터를 수집해서 `src/entities/participant/lib/seasons/season-$ARGUMENTS.json` 파일을 생성해줘.

## 수집 순서

### 1단계: 기수 기본 정보 파악

- `나는솔로 $ARGUMENTS기 출연자` 또는 `나는SOLO $ARGUMENTS기` 로 웹 검색
- 수집 항목:
  - `label`: 기수 부제 (예: "30기 (에겐남 & 테토녀)")
  - `episodes`: 방영 회차 번호와 날짜 목록 (`ep`, `airDate: YYYY-MM-DD`)
  - 출연자 전체 목록 (이름 + 성별)

### 2단계: 출연자별 개인정보 수집

각 출연자에 대해 검색 후 아래 필드를 채운다:

- `birthYear`: 출생연도 (숫자, 없으면 null)
- `job`: 직업/직책 (없으면 null)
- `region`: 거주 지역 (없으면 null)
- `instagram`: 인스타그램 username, @ 제외 (없으면 null)
- `finalChoice`: 최종 선택 상대방 handle (없으면 null)
- `sources`: 참조한 기사/블로그 URL 목록 (string 배열)

**원칙:**

- 출처 없이 필드를 채우지 않는다 — 찾지 못하면 반드시 `null`
- `photo.src`는 항상 `null`로 설정
- `photo.alt`는 `"나는 SOLO $ARGUMENTS기 {handle}"` 형식

### 3단계: 출연자별 방송 하이라이트(bio) 수집

각 출연자에 대해 검색 후 `bio` 필드를 채운다.

**검색 쿼리 (순서대로 시도):**
- `나는솔로 $ARGUMENTS기 {handle} 이슈`
- `나는솔로 $ARGUMENTS기 {handle} 명언`
- `나는솔로 $ARGUMENTS기 {handle} 하이라이트`
- `나는SOLO $ARGUMENTS기 {handle} 화제`

**수집 기준:**
- 방송 중 실제 발생한 화제 행동·멘트·에피소드만 수록
- 출처(기사, 블로그 등)로 확인된 내용만 — 추측성 내용 제외
- 사생활(방송 외 개인 정보) 내용 제외
- 2~4문장, 한국어 서술체로 작성
- 찾지 못하면 반드시 `null` (출처 없이 채우지 않는다)

### 4단계: JSON 파일 생성

아래 스키마를 정확히 준수해서 파일을 작성한다:

```json
{
  "seasonNo": $ARGUMENTS,
  "label": "기수 부제",
  "episodes": [
    { "ep": 회차번호, "airDate": "YYYY-MM-DD" }
  ],
  "participants": [
    {
      "seasonNo": $ARGUMENTS,
      "gender": "M 또는 F",
      "handle": "출연자 이름",
      "photo": { "src": null, "alt": "나는 SOLO $ARGUMENTS기 이름" },
      "instagram": null,
      "profile": {
        "birthYear": null,
        "job": null,
        "region": null
      },
      "sources": [],
      "bio": null,
      "finalChoice": null
    }
  ]
}
```

### 5단계: 빌드 검증

파일 저장 후 아래 명령어로 스키마 검증:

```bash
npm run build
```

빌드 실패 시 에러 메시지를 보고 JSON을 수정한다.

### 6단계: 완료 요약

수집 완료 후 아래 형식으로 요약 출력:

```
✅ season-$ARGUMENTS.json 생성 완료
출연자: N명 (남 N / 여 N)

⚠️ null 필드 목록 (직접 보완 필요):
- 영수: birthYear, region, bio
- 옥순: instagram, bio
...
```
````

- [ ] **Step 2: 빌드로 검증 (커맨드 파일은 빌드에 영향 없음을 확인)**

```bash
npm run build
```

예상 출력:
```
✓ Generating static pages (402/402)
```

- [ ] **Step 3: 커밋**

```bash
git add .claude/commands/fill-season.md
git commit -m "feat: add bio collection step to fill-season command"
```
