# Data Collection Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 스키마에서 불필요한 필드를 제거하고, Claude WebSearch 기반 `/fill-season` 커맨드로 기수 데이터를 자동 수집한다.

**Architecture:** Zod 스키마를 단순화(traits/notableQuotes/issues/SourceSchema 제거, sources → string[])하고, 이를 참조하는 UI 컴포넌트를 정리한 뒤, 기존 JSON 파일을 전부 삭제한다. `.claude/commands/fill-season.md` 커스텀 커맨드를 작성해 Claude가 웹 검색으로 새 스키마 기준 JSON을 생성하게 한다.

**Tech Stack:** Next.js 15, TypeScript, Zod 4, daisyUI 5, Claude Code custom commands

---

## 영향 파일 맵

| 파일 | 변경 유형 |
|------|-----------|
| `src/entities/participant/model/schemas.ts` | 수정 |
| `src/entities/participant/lib/helpers.ts` | 수정 |
| `src/entities/participant/lib/seasons/*.json` | 전체 삭제 |
| `src/entities/participant/ui/ParticipantCard.tsx` | 수정 |
| `src/entities/participant/ui/ParticipantDetailsSections.tsx` | 수정 |
| `src/entities/participant/ui/SourceConfidenceLegend.tsx` | 삭제 |
| `src/entities/participant/index.ts` | 수정 |
| `src/widgets/participant-modal/ui/ParticipantModal.tsx` | 수정 |
| `src/features/participant-filter/lib/filterParticipants.ts` | 수정 |
| `.claude/commands/fill-season.md` | 신규 |
| `CLAUDE.md` | 수정 |
| `.claude/skills/add-season/SKILL.md` | 수정 |

---

## Task 1: 스키마 단순화

**Files:**
- Modify: `src/entities/participant/model/schemas.ts`
- Modify: `src/entities/participant/lib/helpers.ts`

- [ ] **Step 1: schemas.ts 전체 교체**

`src/entities/participant/model/schemas.ts`를 아래 내용으로 교체한다. `ConfidenceSchema`, `SourceSchema`, `Profile.traits/notableQuotes/issues` 제거. `sources`를 `z.array(z.string().url())`로 변경.

```ts
import { z } from "zod";

export const GenderSchema = z.enum(["M", "F"]);

export const PhotoSchema = z.object({
  src: z.string().nullable(),
  alt: z.string(),
});

export const ProfileSchema = z.object({
  birthYear: z.number().int().nullable(),
  job: z.string().nullable(),
  region: z.string().nullable(),
});

export const ParticipantSchema = z.object({
  seasonNo: z.number().int().positive(),
  gender: GenderSchema,
  handle: z.string().min(1),
  photo: PhotoSchema,
  instagram: z.string().nullable(),
  profile: ProfileSchema,
  sources: z.array(z.string().url()),
  finalChoice: z.string().nullable(),
});

export const EpisodeSchema = z.object({
  ep: z.number().int().positive(),
  airDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다"),
});

export const SeasonSchema = z.object({
  seasonNo: z.number().int().positive(),
  label: z.string().min(1),
  episodes: z.array(EpisodeSchema),
  participants: z.array(ParticipantSchema),
});

export const ShowInfoSchema = z.object({
  titleKo: z.string(),
  titleEn: z.string(),
  officialVod: z.string().url(),
});

export type Gender = z.infer<typeof GenderSchema>;
export type Photo = z.infer<typeof PhotoSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Participant = z.infer<typeof ParticipantSchema>;
export type Episode = z.infer<typeof EpisodeSchema>;
export type Season = z.infer<typeof SeasonSchema>;
export type ShowInfo = z.infer<typeof ShowInfoSchema>;
```

- [ ] **Step 2: helpers.ts getParticipantSummary 수정**

`src/entities/participant/lib/helpers.ts`에서 `getParticipantSummary`의 `traits` 폴백을 제거한다.

```ts
export function getParticipantSummary(p: Participant): string {
  return p.profile.job || p.profile.region || '정보 미공개';
}
```

- [ ] **Step 3: 타입 체크**

```bash
npx tsc --noEmit
```

`TS` 에러 목록 확인. 이후 Task에서 순서대로 해결한다. 여기서 에러가 나는 것은 정상이다(아직 UI 파일 미수정).

- [ ] **Step 4: 커밋**

```bash
git add src/entities/participant/model/schemas.ts src/entities/participant/lib/helpers.ts
git commit -m "feat: simplify participant schema — remove traits/notableQuotes/issues/SourceSchema"
```

---

## Task 2: UI 컴포넌트 정리

**Files:**
- Modify: `src/entities/participant/ui/ParticipantCard.tsx`
- Modify: `src/entities/participant/ui/ParticipantDetailsSections.tsx`
- Delete: `src/entities/participant/ui/SourceConfidenceLegend.tsx`
- Modify: `src/entities/participant/index.ts`
- Modify: `src/widgets/participant-modal/ui/ParticipantModal.tsx`
- Modify: `src/features/participant-filter/lib/filterParticipants.ts`

- [ ] **Step 1: ParticipantCard — traitPreview 블록 제거**

`src/entities/participant/ui/ParticipantCard.tsx`에서 아래 두 곳을 삭제한다.

삭제할 변수 선언 (파일 상단부):
```ts
// 삭제
const traitPreview = p.profile.traits.slice(
  0,
  variant === "editorial" ? 3 : 2,
);
```

삭제할 JSX 블록:
```tsx
// 삭제 — traitPreview 렌더링 블록 전체
{traitPreview.length > 0 ? (
  <div className="flex flex-wrap gap-2">
    {traitPreview.map((trait) => (
      <span
        key={trait}
        title={trait}
        className="badge badge-outline h-7 max-w-full border-base-300/80 bg-base-100/80 px-3"
      >
        <span className="block max-w-full truncate">
          {formatTraitPreview(trait)}
        </span>
      </span>
    ))}
  </div>
) : (
  <p className="text-sm text-base-content/55">프로필 요약 준비 중</p>
)}
```

`formatTraitPreview` 함수도 더 이상 사용되지 않으므로 삭제한다:
```ts
// 삭제
function formatTraitPreview(trait: string, maxLength = 22): string {
  if (trait.length <= maxLength) return trait;
  return `${trait.slice(0, maxLength).trimEnd()}...`;
}
```

- [ ] **Step 2: ParticipantDetailsSections 전체 교체**

`src/entities/participant/ui/ParticipantDetailsSections.tsx`를 아래로 교체한다. `traits`, `notableQuotes`, `issues` 섹션 및 `showLegend` prop 제거. `sources`를 URL 링크 목록으로 변경.

```tsx
import Link from 'next/link';
import type { Participant } from '../model/schemas';
import { getParticipantUrl } from '../lib/helpers';

interface Props {
  participant: Participant;
  age: string;
  finalChoiceParticipant?: Participant | null;
  showGender?: boolean;
  showInstagramInFacts?: boolean;
  className?: string;
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="stat">
      <dt className="stat-title text-[10px] font-bold uppercase tracking-wider">
        {label}
      </dt>
      <dd className="stat-value mt-0 text-sm font-medium">
        {value ?? '미공개'}
      </dd>
    </div>
  );
}

export default function ParticipantDetailsSections({
  participant: p,
  age,
  finalChoiceParticipant = null,
  showGender = false,
  showInstagramInFacts = false,
  className,
}: Props) {
  return (
    <div className={className}>
      <dl className="stats stats-vertical sm:stats-horizontal w-full border border-base-300 bg-base-200/70 shadow-sm">
        <InfoItem label="나이" value={age} />
        <InfoItem label="직업" value={p.profile.job} />
        <InfoItem label="지역" value={p.profile.region} />
        <div className="stat">
          <dt className="stat-title text-[10px] font-bold uppercase tracking-wider">
            최종 선택
          </dt>
          <dd className="stat-value mt-0 text-sm font-medium">
            {p.finalChoice ? (
              finalChoiceParticipant ? (
                <Link
                  href={getParticipantUrl(finalChoiceParticipant)}
                  className="link link-primary"
                >
                  {p.finalChoice}
                </Link>
              ) : (
                p.finalChoice
              )
            ) : (
              '선택 안 함'
            )}
          </dd>
        </div>
        {showGender ? (
          <InfoItem label="성별" value={p.gender === 'M' ? '남' : '여'} />
        ) : null}
        {showInstagramInFacts && p.instagram ? (
          <div className="stat">
            <dt className="stat-title text-[10px] font-bold uppercase tracking-wider">
              인스타그램
            </dt>
            <dd className="stat-value mt-0 text-sm font-medium">
              <a
                href={`https://instagram.com/${p.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                @{p.instagram}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>

      {p.sources.length > 0 ? (
        <section className="mt-5">
          <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-base-content/55">
            출처
          </h2>
          <ul className="space-y-2">
            {p.sources.map((url, index) => (
              <li key={`${url}-${index}`} className="text-sm">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary break-all"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 3: SourceConfidenceLegend 삭제**

```bash
rm src/entities/participant/ui/SourceConfidenceLegend.tsx
```

- [ ] **Step 4: index.ts에서 SourceConfidenceLegend export 제거**

`src/entities/participant/index.ts`에서 아래 줄을 삭제한다:

```ts
// 삭제
export { default as SourceConfidenceLegend } from './ui/SourceConfidenceLegend';
```

또한 타입 export에서 `Confidence`, `Source`도 삭제한다:

```ts
// 변경 전
export type { Participant, Season, Episode, ShowInfo, Gender, Confidence, Photo, Source, Profile } from './model/schemas';

// 변경 후
export type { Participant, Season, Episode, ShowInfo, Gender, Photo, Profile } from './model/schemas';
```

- [ ] **Step 5: ParticipantModal — SourceConfidenceLegend 제거**

`src/widgets/participant-modal/ui/ParticipantModal.tsx`에서:

import 줄 수정:
```ts
// 변경 전
import {
  formatKoreanAge,
  getFinalChoiceParticipant,
  getParticipantUrl,
  ParticipantDetailsSections,
  SourceConfidenceLegend,
  type Season,
  type Participant,
} from "@/entities/participant";

// 변경 후
import {
  formatKoreanAge,
  getFinalChoiceParticipant,
  getParticipantUrl,
  ParticipantDetailsSections,
  type Season,
  type Participant,
} from "@/entities/participant";
```

하단 footer 영역 교체:
```tsx
// 변경 전
<div className="flex items-center justify-between border-t border-base-300 px-6 pb-6 pt-1">
  <SourceConfidenceLegend />
  <Link
    href={getParticipantUrl(p)}
    className="btn btn-ghost btn-sm text-primary"
  >
    개별 페이지 보기
  </Link>
</div>

// 변경 후
<div className="flex justify-end border-t border-base-300 px-6 pb-6 pt-4">
  <Link
    href={getParticipantUrl(p)}
    className="btn btn-ghost btn-sm text-primary"
  >
    개별 페이지 보기
  </Link>
</div>
```

- [ ] **Step 6: filterParticipants — traits/notableQuotes 제거**

`src/features/participant-filter/lib/filterParticipants.ts`에서 searchable 구성 변경:

```ts
// 변경 전
const searchable = normalize(
  [
    p.handle,
    p.profile.job ?? '',
    p.profile.region ?? '',
    ...p.profile.traits,
    ...p.profile.notableQuotes,
  ].join(' '),
);

// 변경 후
const searchable = normalize(
  [p.handle, p.profile.job ?? '', p.profile.region ?? ''].join(' '),
);
```

- [ ] **Step 7: 상세 페이지 showLegend prop 제거**

`src/app/season/[seasonNo]/[gender]/[handle]/page.tsx`에서 `showLegend` prop을 삭제한다:

```tsx
// 변경 전
<ParticipantDetailsSections
  participant={p}
  age={age}
  finalChoiceParticipant={finalChoiceParticipant}
  showGender
  showLegend
/>

// 변경 후
<ParticipantDetailsSections
  participant={p}
  age={age}
  finalChoiceParticipant={finalChoiceParticipant}
  showGender
/>
```

- [ ] **Step 8: 타입 체크**

```bash
npx tsc --noEmit
```

에러 없이 통과해야 한다.

- [ ] **Step 9: 커밋**

```bash
git add src/entities/participant/ui/ParticipantCard.tsx \
        src/entities/participant/ui/ParticipantDetailsSections.tsx \
        src/entities/participant/index.ts \
        src/widgets/participant-modal/ui/ParticipantModal.tsx \
        src/features/participant-filter/lib/filterParticipants.ts \
        src/app/season/[seasonNo]/[gender]/[handle]/page.tsx
git rm src/entities/participant/ui/SourceConfidenceLegend.tsx
git commit -m "feat: remove deprecated UI components — traits, notableQuotes, issues, SourceConfidenceLegend"
```

---

## Task 3: 기존 JSON 데이터 삭제 및 빌드 검증

**Files:**
- Delete: `src/entities/participant/lib/seasons/*.json`

- [ ] **Step 1: 기존 JSON 파일 전체 삭제**

```bash
rm src/entities/participant/lib/seasons/season-*.json
```

- [ ] **Step 2: 빌드 검증**

```bash
npm run build
```

`SEASONS_DATA`가 빈 배열인 상태로도 빌드가 성공해야 한다. 정적 페이지 수는 최소(홈, 404 등)만 생성된다.

- [ ] **Step 3: 커밋**

```bash
git add -A
git commit -m "chore: delete all season JSON files — to be repopulated with new schema"
```

---

## Task 4: fill-season 커스텀 커맨드 작성

**Files:**
- Create: `.claude/commands/fill-season.md`

- [ ] **Step 1: 커맨드 파일 생성**

`.claude/commands/fill-season.md`를 아래 내용으로 생성한다.

```markdown
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

### 3단계: JSON 파일 생성

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
      "finalChoice": null
    }
  ]
}
```

### 4단계: 빌드 검증

파일 저장 후 아래 명령어로 스키마 검증:

```bash
npm run build
```

빌드 실패 시 에러 메시지를 보고 JSON을 수정한다.

### 5단계: 완료 요약

수집 완료 후 아래 형식으로 요약 출력:

```
✅ season-$ARGUMENTS.json 생성 완료
출연자: N명 (남 N / 여 N)

⚠️ null 필드 목록 (직접 보완 필요):
- 영수: birthYear, region
- 옥순: instagram
...
```
```

- [ ] **Step 2: 커맨드 동작 테스트**

Claude Code에서 아래를 실행해 커맨드가 작동하는지 확인한다:

```
/fill-season 18
```

`src/entities/participant/lib/seasons/season-18.json` 파일이 생성되고 `npm run build`가 성공하면 정상.

- [ ] **Step 3: 커밋**

```bash
git add .claude/commands/fill-season.md
git commit -m "feat: add /fill-season custom command for automated data collection"
```

---

## Task 5: CLAUDE.md 및 스킬 업데이트

**Files:**
- Modify: `CLAUDE.md`
- Modify: `.claude/skills/add-season/SKILL.md`

- [ ] **Step 1: CLAUDE.md 데이터 레이어 섹션 업데이트**

`CLAUDE.md`의 "데이터 레이어" 섹션을 아래로 교체한다:

```markdown
## 데이터 레이어

`src/entities/participant/lib/seasons/season-{기수}.json` 파일을 자동 수집해 `SeasonSchema`로 Zod 검증 후 최신순 정렬.

**새 기수 추가:** `/fill-season {기수번호}` 커스텀 커맨드 실행 → JSON 자동 생성. 별도 import 코드 불필요.

Zod 스키마 (`model/schemas.ts`)가 단일 진실 공급원. `z.infer<>` 기반 타입 추론.
- `Participant.profile`: `birthYear · job · region` 세 필드만 존재
- `Participant.sources`: `string[]` — 참조 URL 배열
- `Participant.instagram`: `@` 제외 username 또는 `null`

사진은 외부 호스팅. 새 도메인 사용 시 `next.config.ts`의 `images.remotePatterns` 추가 필요.
```

- [ ] **Step 2: add-season 스킬 업데이트**

`.claude/skills/add-season/SKILL.md`의 내용을 새 스키마에 맞게 교체한다:

```markdown
---
name: add-season
description: Use when adding a new season's participant data to the archive or updating existing season data. Covers the /fill-season command and JSON schema.
---

# Add Season

새 기수 데이터를 추가할 때는 `/fill-season {기수번호}` 커스텀 커맨드를 사용한다.

## 커맨드 실행

```
/fill-season 31
```

Claude가 웹 검색으로 데이터를 수집해 `src/entities/participant/lib/seasons/season-31.json`을 자동 생성한다.

## 파일 위치 및 네이밍

```
src/entities/participant/lib/seasons/season-{숫자}.json
```

## JSON 구조

```json
{
  "seasonNo": 31,
  "label": "31기 (부제)",
  "episodes": [
    { "ep": 250, "airDate": "2026-06-04" }
  ],
  "participants": [
    {
      "seasonNo": 31,
      "gender": "M",
      "handle": "영수",
      "photo": { "src": null, "alt": "나는 SOLO 31기 영수" },
      "instagram": null,
      "profile": {
        "birthYear": 1992,
        "job": "직업",
        "region": "서울"
      },
      "sources": ["https://example.com/article"],
      "finalChoice": null
    }
  ]
}
```

## profile 필드

| 필드 | 타입 | 비고 |
|------|------|------|
| `birthYear` | `number \| null` | 출생연도 |
| `job` | `string \| null` | 직업/직책 |
| `region` | `string \| null` | 거주 지역 |

`traits`, `notableQuotes`, `issues`는 스키마에 없다.

## 검증

```bash
npm run build
```

Zod 스키마 검증 포함 — 실패 시 에러 출력.

## 흔한 실수

- 각 participant에 `seasonNo` 빠뜨리기 → Zod 에러
- `sources`를 객체 배열로 작성 → `string[]`이어야 함
- `instagram`에 `@` 포함 → username만 입력
- `airDate` 형식이 `YYYY-MM-DD`가 아닌 경우 → Zod 에러
```

- [ ] **Step 3: 최종 빌드 확인**

```bash
npm run build
```

- [ ] **Step 4: 최종 커밋**

```bash
git add CLAUDE.md .claude/skills/add-season/SKILL.md
git commit -m "docs: update CLAUDE.md and add-season skill for new schema and /fill-season command"
```
