# Homepage UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the im-solo-archive homepage with a Cream & Charcoal editorial palette, text-only participant cards, and a numbered season chip grid replacing the current multi-section hero layout.

**Architecture:** Palette override injects CSS variables on top of daisyUI's bumblebee/forest themes in globals.css. Component changes are isolated — SeasonTabs, ParticipantCard, and the detail page each change independently. page.tsx is stripped to a compact title + ClientHome; ClientHome loses its sticky sidebar.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v4, daisyUI v5, Google Fonts (Noto Serif KR, Noto Sans KR, Playfair Display)

---

## File Map

| File | Change |
|------|--------|
| `src/app/globals.css` | Cream & Charcoal CSS variable overrides; simplified body bg; remove `detail-hero-*` classes |
| `src/app/layout.tsx` | Add Google Fonts `<link>` tags; add portrait rights line to footer |
| `src/entities/participant/lib/age.ts` | Add `formatAgeWithBirthYear()` |
| `src/entities/participant/index.ts` | Export `formatAgeWithBirthYear` |
| `src/features/season-select/ui/SeasonTabs.tsx` | Rewrite as numbered chip grid |
| `src/entities/participant/ui/ParticipantCard.tsx` | Remove photo; horizontal text-only layout; age+birthYear display |
| `src/app/page.tsx` | Remove Hero, Archive Status, Season Rail; add compact `<h1>` title |
| `src/widgets/home-interactive/ui/ClientHome.tsx` | Remove sticky sidebar; full-width card grid |
| `src/app/season/[seasonNo]/[gender]/[handle]/page.tsx` | Remove photo; single-column layout; remove unused `Image` import |
| `src/entities/participant/ui/ParticipantDetailsSections.tsx` | Add portrait notice; `decodeURIComponent` on source URLs |

---

### Task 1: CSS Palette & Font Variables

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace globals.css with Cream & Charcoal palette**

Replace the entire contents of `src/app/globals.css`:

```css
@import "tailwindcss";

@plugin "daisyui" {
  themes: bumblebee --default, forest --prefersdark;
  logs: false;
}

/* ── Cream & Charcoal (light) ──────────────────────────── */
:root,
[data-theme="bumblebee"] {
  --color-base-100: #FDFBF7;
  --color-base-200: #F5F0E8;
  --color-base-300: #D4CFC6;
  --color-base-content: #1A1A1A;
  --color-primary: #1A1A1A;
  --color-primary-content: #FDFBF7;
  --color-secondary: #C4916B;
  --color-secondary-content: #FDFBF7;
  --color-accent: #8B6F5C;
  --color-accent-content: #FDFBF7;
  --color-neutral: #6B6B6B;
  --color-neutral-content: #FDFBF7;
  --color-info: #2B4C7E;
  --color-info-content: #FDFBF7;
  --color-error: #C4916B;
  --color-error-content: #FDFBF7;
  --color-success: #5B7B5B;
  --color-success-content: #FDFBF7;
  --color-warning: #8B6F5C;
  --color-warning-content: #FDFBF7;
}

/* ── Deep Navy & Coral (dark) ──────────────────────────── */
[data-theme="forest"] {
  --color-base-100: #1E2C3D;
  --color-base-200: #161F2C;
  --color-base-300: #2A3A4E;
  --color-base-content: #E8E2D8;
  --color-primary: #E8E2D8;
  --color-primary-content: #1E2C3D;
  --color-secondary: #E8735A;
  --color-secondary-content: #1E2C3D;
  --color-accent: #E8735A;
  --color-accent-content: #1E2C3D;
  --color-neutral: #8A9BAD;
  --color-neutral-content: #1E2C3D;
  --color-info: #5B8DB8;
  --color-info-content: #1E2C3D;
  --color-error: #E8735A;
  --color-error-content: #1E2C3D;
  --color-success: #5B8B6B;
  --color-success-content: #1E2C3D;
  --color-warning: #E8A85A;
  --color-warning-content: #1E2C3D;
}

:root {
  --font-sans: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  --font-title: 'Noto Serif KR', 'Apple SD Gothic Neo', serif;
  --font-display: 'Playfair Display', 'Noto Serif KR', serif;
}

@layer base {
  html {
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
  }

  body {
    min-height: 100vh;
    background-color: var(--color-base-200);
    color: var(--color-base-content);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::selection {
    background: color-mix(in oklab, var(--color-primary) 20%, transparent);
  }
}

@layer components {
  .app-shell {
    @apply min-h-screen bg-transparent text-base-content;
  }

  .glass-panel {
    border: 1px solid var(--color-base-300);
    background-color: color-mix(in oklab, var(--color-base-100) 90%, transparent);
    box-shadow: 0 8px 24px -12px rgb(0 0 0 / 0.1);
    backdrop-filter: blur(12px);
  }

  .section-title {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: color-mix(in oklab, var(--color-base-content) 50%, transparent);
  }

  .soft-stat {
    border: 1px solid var(--color-base-300);
    background-color: var(--color-base-100);
    border-radius: 0.75rem;
  }

  .surface-card {
    border: 1px solid var(--color-base-300);
    background-color: var(--color-base-100);
    box-shadow: 0 2px 8px -4px rgb(0 0 0 / 0.08);
  }

  .surface-card:hover {
    border-color: color-mix(in oklab, var(--color-base-content) 20%, var(--color-base-300));
    box-shadow: 0 8px 24px -8px rgb(0 0 0 / 0.12);
  }
}

@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

@keyframes modal-overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modal-popup-in {
  from { opacity: 0; transform: scale(0.965) translateY(12px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes float-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-modal-overlay { animation: modal-overlay-in 0.2s ease both; }
.animate-modal-content { animation: modal-popup-in 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-float-in { animation: float-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds. 402+ static pages generated.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: apply Cream & Charcoal palette, Deep Navy & Coral dark mode"
```

---

### Task 2: Fonts & Footer

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add Google Fonts links inside `<head>`**

In `RootLayout`, add three `<link>` tags inside `<head>`, after the existing `<script>` block:

```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  rel="preconnect"
  href="https://fonts.gstatic.com"
  crossOrigin="anonymous"
/>
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&family=Noto+Serif+KR:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 2: Add portrait rights line to footer**

In the `<footer>` section, add one `<p>` immediately after the existing "본 사이트는..." paragraph:

```tsx
<p className="mt-1.5">출연자 사진은 초상권 보호를 위해 게재하지 않습니다.</p>
```

The footer `<div>` should end up as:

```tsx
<div className="max-w-6xl mx-auto px-4 py-8 text-sm text-base-content/70">
  <p>
    본 사이트는 공개된 뉴스 기사 기반의 비공식 아카이브입니다.{" "}
    <a
      href={SHOW_INFO.officialVod}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="나는 SOLO 공식 VOD (새 탭에서 열림)"
      className="link link-primary font-medium"
    >
      나는 SOLO 공식 VOD
    </a>
  </p>
  <p className="mt-1.5">출연자 사진은 초상권 보호를 위해 게재하지 않습니다.</p>
  <p className="mt-1.5">
    문의:{" "}
    <a href="mailto:imsoloarchive@gmail.com" className="link link-primary font-medium">
      imsoloarchive@gmail.com
    </a>
  </p>
  <p className="mt-1.5">
    GitHub:{" "}
    <a
      href="https://github.com/okcleff/im-solo-archive"
      target="_blank"
      rel="noopener noreferrer"
      className="link link-primary font-medium"
    >
      github.com/okcleff/im-solo-archive
    </a>
  </p>
  <p className="mt-1.5 text-xs">데이터 최종 업데이트: 2026-03-04</p>
</div>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: load Noto/Playfair fonts and add portrait rights notice to footer"
```

---

### Task 3: Age Display Helper

**Files:**
- Modify: `src/entities/participant/lib/age.ts`
- Modify: `src/entities/participant/index.ts`

- [ ] **Step 1: Add `formatAgeWithBirthYear` to age.ts**

Append to `src/entities/participant/lib/age.ts`:

```ts
/**
 * 카드 표시용 나이+출생연도 복합 문자열을 반환한다.
 * birthYear가 null이면 null 반환 — 카드에서 해당 줄을 숨긴다.
 *
 * @returns 예: `"35세 (1992년생)"` | `null`
 */
export function formatAgeWithBirthYear(
  birthYear: number | null,
  currentYear: number,
): string | null {
  if (birthYear === null) return null;
  const age = currentYear - birthYear + 1;
  return `${age}세 (${birthYear}년생)`;
}
```

- [ ] **Step 2: Re-export from entity index**

In `src/entities/participant/index.ts`, update the age export line from:

```ts
export { formatKoreanAge } from './lib/age';
```

to:

```ts
export { formatKoreanAge, formatAgeWithBirthYear } from './lib/age';
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/entities/participant/lib/age.ts src/entities/participant/index.ts
git commit -m "feat: add formatAgeWithBirthYear helper for card age display"
```

---

### Task 4: Season Chip Grid

**Files:**
- Modify: `src/features/season-select/ui/SeasonTabs.tsx`

- [ ] **Step 1: Rewrite SeasonTabs as a numbered chip grid**

Replace the entire contents of `src/features/season-select/ui/SeasonTabs.tsx`:

```tsx
"use client";

import type { Season } from "@/entities/participant";

interface Props {
  seasons: Season[];
  selectedSeasonNo: number;
  onChange: (seasonNo: number) => void;
}

export default function SeasonTabs({
  seasons,
  selectedSeasonNo,
  onChange,
}: Props) {
  const sorted = [...seasons].sort((a, b) => a.seasonNo - b.seasonNo);

  return (
    <div className="px-4 pt-5 pb-2">
      <div className="max-w-6xl mx-auto">
        <div
          role="tablist"
          aria-label="기수 선택"
          className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2"
        >
          {sorted.map((s) => {
            const active = s.seasonNo === selectedSeasonNo;
            return (
              <button
                key={s.seasonNo}
                role="tab"
                aria-selected={active}
                onClick={() => onChange(s.seasonNo)}
                className={`rounded-lg border py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer font-[var(--font-display)] ${
                  active
                    ? "border-[var(--color-base-content)] bg-[var(--color-base-content)] text-[var(--color-base-100)]"
                    : "border-[var(--color-base-300)] bg-[var(--color-base-100)] text-[var(--color-base-content)] hover:border-[var(--color-base-content)]/40 hover:bg-[var(--color-base-200)]"
                }`}
              >
                {s.seasonNo}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds. The `useEffect` / `useRef` from the old horizontal carousel are gone; no dangling imports.

- [ ] **Step 3: Commit**

```bash
git add src/features/season-select/ui/SeasonTabs.tsx
git commit -m "feat: replace season carousel with numbered chip grid"
```

---

### Task 5: Participant Card Redesign

**Files:**
- Modify: `src/entities/participant/ui/ParticipantCard.tsx`

- [ ] **Step 1: Rewrite ParticipantCard — text-only horizontal layout**

Replace the entire contents of `src/entities/participant/ui/ParticipantCard.tsx`:

```tsx
"use client";

import Link from "next/link";
import type { Participant } from "../model/schemas";
import { formatAgeWithBirthYear } from "../lib/age";
import { getParticipantUrl } from "../lib/helpers";
import { getCurrentYear } from "@/shared/lib/utils";

interface Props {
  participant: Participant;
  onClick?: () => void;
  asLink?: boolean;
  className?: string;
}

export default function ParticipantCard({
  participant: p,
  onClick,
  asLink = false,
  className = "",
}: Props) {
  const href = getParticipantUrl(p);
  const isMale = p.gender === "M";
  const ageText = formatAgeWithBirthYear(p.profile.birthYear, getCurrentYear());
  const metaParts = [p.profile.region, ageText].filter(Boolean);
  const accentBadgeClass = isMale
    ? "bg-info text-info-content"
    : "bg-secondary text-secondary-content";
  const accentLineClass = isMale ? "bg-info" : "bg-secondary";

  const content = (
    <div
      className={`surface-card rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`.trim()}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[11px] font-semibold text-[var(--color-base-content)]/50">
          {p.seasonNo}기
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${accentBadgeClass}`}
        >
          {isMale ? "남" : "여"}
        </span>
      </div>

      <h3 className="font-[var(--font-title)] text-xl tracking-tight leading-tight">
        {p.handle}
      </h3>

      {p.profile.job ? (
        <p className="mt-1 text-sm text-[var(--color-base-content)]/65">
          {p.profile.job}
        </p>
      ) : null}

      {metaParts.length > 0 ? (
        <p className="mt-1.5 text-[11px] text-[var(--color-base-content)]/45">
          {metaParts.join(" · ")}
        </p>
      ) : null}

      <div
        className={`h-[2px] w-full mt-3 rounded-full ${accentLineClass}`}
        aria-hidden="true"
      />
    </div>
  );

  if (asLink) {
    return (
      <article>
        <Link href={href} className="block">
          {content}
        </Link>
      </article>
    );
  }

  return (
    <article>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => e.key === "Enter" && onClick?.()}
        aria-label={`${p.handle} 상세 정보 보기`}
        className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      >
        {content}
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds. Old `Image` and `formatKoreanAge` imports from this file are gone.

- [ ] **Step 3: Commit**

```bash
git add src/entities/participant/ui/ParticipantCard.tsx
git commit -m "feat: redesign ParticipantCard — text-only layout with age+birthYear"
```

---

### Task 6: Homepage Simplification

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Strip Hero, Archive Status, Season Rail; add compact title**

Replace the entire contents of `src/app/page.tsx`:

```tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { SEASONS_DATA } from "@/entities/participant/server";
import { getSiteUrl, SITE_NAME } from "@/shared/config/site";
import JsonLd from "@/shared/ui/JsonLd";
import { ClientHome } from "@/widgets/home-interactive";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: `나는 SOLO 출연자 아카이브 | 전 기수 프로필 총정리`,
  description: `나는 SOLO 전 기수 출연자 직업, 나이, 지역, 특징을 한눈에 검색하세요.`,
  alternates: { canonical: BASE },
  openGraph: {
    title: `나는 SOLO 출연자 아카이브`,
    description: "나는 SOLO 전 기수 출연자 프로필을 검색하고 비교하세요.",
    url: BASE,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${SITE_NAME} 기수 목록`,
  description: "나는 SOLO 전 기수 출연자 아카이브",
  url: BASE,
  itemListElement: SEASONS_DATA.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: s.label,
    url: `${BASE}/season/${s.seasonNo}`,
  })),
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="max-w-6xl mx-auto px-4 pt-8 pb-2">
        <h1 className="text-xs font-bold tracking-[0.28em] uppercase text-[var(--color-base-content)]/55">
          나는 SOLO 출연진 아카이브
        </h1>
      </div>

      <div className="max-w-6xl mx-auto">
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-20">
              <span
                className="loading loading-spinner loading-md"
                aria-hidden="true"
              />
              <span className="ml-3 text-sm text-[var(--color-base-content)]/60">
                로딩 중...
              </span>
            </div>
          }
        >
          <ClientHome seasons={SEASONS_DATA} />
        </Suspense>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds. `getLatestAirDate`, `LATEST_SEASON` and stats variables are removed from this file.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: strip homepage to compact title + ClientHome"
```

---

### Task 7: ClientHome Layout Simplification

**Files:**
- Modify: `src/widgets/home-interactive/ui/ClientHome.tsx`

- [ ] **Step 1: Remove sticky sidebar; update card grid to full-width**

Replace the entire contents of `src/widgets/home-interactive/ui/ClientHome.tsx`:

```tsx
"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Season, Participant } from "@/entities/participant";
import { ParticipantCard } from "@/entities/participant";
import { SeasonTabs } from "@/features/season-select";
import { FilterBar, filterParticipants } from "@/features/participant-filter";
import { ParticipantModal } from "@/widgets/participant-modal";

const NOTICE_STORAGE_KEY = "notice-dismissed-v1";

interface Props {
  seasons: Season[];
}

function ParticipantBoard({
  title,
  tone,
  participants,
  onSelect,
}: {
  title: string;
  tone: "info" | "secondary";
  participants: Participant[];
  onSelect: (participant: Participant) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              tone === "info" ? "bg-info" : "bg-secondary"
            }`}
          />
          <h2 className="section-title">{title}</h2>
        </div>
        <span className="text-xs text-[var(--color-base-content)]/45">
          {participants.length}명
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {participants.map((participant) => (
          <ParticipantCard
            key={`${participant.seasonNo}-${participant.gender}-${participant.handle}`}
            participant={participant}
            onClick={() => onSelect(participant)}
          />
        ))}
      </div>
    </section>
  );
}

export default function ClientHome({ seasons }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const selectedSeasonNo = Number(
    searchParams.get("season") ?? seasons[0].seasonNo,
  );
  const selectedGender = searchParams.get("gender") ?? "all";
  const searchQuery = searchParams.get("q") ?? "";
  const hasQuery = searchQuery.trim().length > 0;

  const [modalParticipant, setModalParticipant] = useState<Participant | null>(null);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(NOTICE_STORAGE_KEY) !== "true") {
      setShowNotice(true);
    }
  }, []);

  const handleDismissForever = () => {
    localStorage.setItem(NOTICE_STORAGE_KEY, "true");
    setShowNotice(false);
  };

  const currentSeason =
    seasons.find((s) => s.seasonNo === selectedSeasonNo) ?? seasons[0];
  const modalSeason = modalParticipant
    ? seasons.find((s) => s.seasonNo === modalParticipant.seasonNo) ?? null
    : null;
  const searchScopeParticipants = hasQuery
    ? seasons.flatMap((s) => s.participants)
    : currentSeason.participants;

  const filtered = filterParticipants(searchScopeParticipants, selectedGender, searchQuery);
  const males = filtered.filter((p) => p.gender === "M");
  const females = filtered.filter((p) => p.gender === "F");

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (!v || v === "all") params.delete(k);
        else params.set(k, v);
      }
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  return (
    <>
      <SeasonTabs
        seasons={seasons}
        selectedSeasonNo={currentSeason.seasonNo}
        onChange={(no) => updateParams({ season: String(no), q: null })}
      />

      <FilterBar
        gender={selectedGender}
        query={searchQuery}
        onGenderChange={(g) => updateParams({ gender: g })}
        onQueryChange={(q) => updateParams({ q })}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-14 space-y-8">
        {filtered.length === 0 ? (
          <p className="text-sm text-[var(--color-base-content)]/55 py-12 text-center">
            검색 결과가 없습니다.
          </p>
        ) : selectedGender === "all" ? (
          <>
            {males.length > 0 && (
              <ParticipantBoard
                title="남성 출연자"
                tone="info"
                participants={males}
                onSelect={setModalParticipant}
              />
            )}
            {females.length > 0 && (
              <ParticipantBoard
                title="여성 출연자"
                tone="secondary"
                participants={females}
                onSelect={setModalParticipant}
              />
            )}
          </>
        ) : (
          <ParticipantBoard
            title={selectedGender === "M" ? "남성 출연자" : "여성 출연자"}
            tone={selectedGender === "M" ? "info" : "secondary"}
            participants={filtered}
            onSelect={setModalParticipant}
          />
        )}
      </div>

      {modalParticipant && modalSeason ? (
        <ParticipantModal
          participant={modalParticipant}
          season={modalSeason}
          onClose={() => setModalParticipant(null)}
        />
      ) : null}

      {showNotice ? (
        <div
          className="modal modal-open px-4"
          onClick={() => setShowNotice(false)}
        >
          <div
            className="modal-box border border-[var(--color-base-300)] bg-[var(--color-base-100)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold">안내</h2>
              <p className="text-sm leading-relaxed text-[var(--color-base-content)]/70">
                이 사이트는{" "}
                <span className="font-semibold text-[var(--color-base-content)]">
                  vibe coding
                </span>
                으로 제작된 비공식 팬 아카이브입니다. 출연진 정보에 누락이나
                오류가 있을 수 있습니다.
              </p>
              <p className="text-sm leading-relaxed text-[var(--color-base-content)]/70">
                보완·정정·제보 및 사이트 제안사항은 아래 메일로 보내주세요.
              </p>
              <a
                href="mailto:imsoloarchive@gmail.com"
                className="link link-primary text-sm break-all"
              >
                imsoloarchive@gmail.com
              </a>
            </div>
            <div className="modal-action mt-5">
              <button
                onClick={handleDismissForever}
                className="btn btn-outline btn-sm"
              >
                다시 보지 않기
              </button>
              <button
                onClick={() => setShowNotice(false)}
                className="btn btn-primary btn-sm"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds. `getEpisodeRange` (local helper) no longer in file; no unused variable errors.

- [ ] **Step 3: Commit**

```bash
git add src/widgets/home-interactive/ui/ClientHome.tsx
git commit -m "feat: remove sidebar, expand card grid to full width"
```

---

### Task 8: Detail Page Simplification

**Files:**
- Modify: `src/app/season/[seasonNo]/[gender]/[handle]/page.tsx`

- [ ] **Step 1: Remove photo column, rewrite to single-column layout**

Keep all imports except remove `Image from "next/image"` (no longer used). Keep `generateStaticParams`, `generateMetadata`, and `InstagramIcon` unchanged. Replace only the `export default async function ParticipantPage` body:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  SEASONS_DATA,
  getParticipantByRoute,
  getSeasonByNo,
} from "@/entities/participant/server";
import {
  formatKoreanAge,
  getFinalChoiceParticipant,
  getParticipantUrl,
  getParticipantSummary,
  ParticipantDetailsSections,
} from "@/entities/participant";
import { getSiteUrl } from "@/shared/config/site";
import { getCurrentYear } from "@/shared/lib/utils";
import JsonLd from "@/shared/ui/JsonLd";

interface Props {
  params: Promise<{ seasonNo: string; gender: string; handle: string }>;
}

export function generateStaticParams() {
  return SEASONS_DATA.flatMap((s) =>
    s.participants.map((p) => ({
      seasonNo: String(p.seasonNo),
      gender: p.gender.toLowerCase(),
      handle: p.handle,
    })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seasonNo, gender, handle } = await params;
  const p = getParticipantByRoute(SEASONS_DATA, Number(seasonNo), gender, handle);
  if (!p) return {};

  const base = getSiteUrl();
  const url = `${base}${getParticipantUrl(p)}`;
  const age = formatKoreanAge(p.profile.birthYear, getCurrentYear());
  const summary = getParticipantSummary(p);
  const title = `${p.handle} (나는 SOLO ${p.seasonNo}기) 프로필`;
  const description = `나는 SOLO ${p.seasonNo}기 ${p.gender === "M" ? "남" : "여"} 출연자 ${p.handle}. ${age !== "미공개" ? `${age} · ` : ""}${summary}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "profile" },
  };
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default async function ParticipantPage({ params }: Props) {
  const { seasonNo, gender, handle } = await params;
  const season = getSeasonByNo(SEASONS_DATA, Number(seasonNo));
  if (!season) notFound();

  const p = getParticipantByRoute(SEASONS_DATA, Number(seasonNo), gender, handle);
  if (!p) notFound();

  const base = getSiteUrl();
  const age = formatKoreanAge(p.profile.birthYear, getCurrentYear());
  const summary = getParticipantSummary(p);
  const finalChoiceParticipant = getFinalChoiceParticipant(season, p);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `${p.handle} (나는 SOLO ${p.seasonNo}기)`,
    description: summary,
    jobTitle: p.profile.job ?? undefined,
    homeLocation: p.profile.region
      ? { "@type": "Place", name: p.profile.region }
      : undefined,
    url: `${base}${getParticipantUrl(p)}`,
    sameAs: [
      ...p.sources,
      ...(p.instagram ? [`https://instagram.com/${p.instagram}`] : []),
    ],
  };
  const genderLabel = p.gender === "M" ? "남성 출연자" : "여성 출연자";
  const accentTone = p.gender === "M" ? "badge-info" : "badge-error";

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="px-4 pt-8 sm:pt-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link
              href={`/season/${p.seasonNo}`}
              className="btn btn-ghost btn-sm rounded-full px-4"
            >
              ← {p.seasonNo}기 출연자 목록
            </Link>
            <span
              className={`badge ${accentTone} badge-outline h-8 px-3 font-semibold`}
            >
              {genderLabel}
            </span>
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-base-content)]/45">
            info
          </p>
          <h1 className="mt-3 font-[var(--font-title)] text-5xl tracking-tight text-[var(--color-base-content)] sm:text-6xl">
            {p.handle}
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--color-base-content)]/65 sm:text-lg">
            {summary}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--color-base-300)] bg-[var(--color-base-200)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-base-content)]/45">
                season
              </p>
              <p className="mt-2 text-lg font-semibold font-[var(--font-display)]">
                {p.seasonNo}기
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-base-300)] bg-[var(--color-base-200)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-base-content)]/45">
                age
              </p>
              <p className="mt-2 text-lg font-semibold font-[var(--font-display)]">
                {age}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-base-300)] bg-[var(--color-base-200)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-base-content)]/45">
                region
              </p>
              <p className="mt-2 text-lg font-semibold">
                {p.profile.region ?? "미공개"}
              </p>
            </div>
          </div>

          {p.instagram ? (
            <div className="mt-6">
              <a
                href={`https://instagram.com/${p.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm rounded-full border-[var(--color-base-300)] bg-[var(--color-base-100)] px-4 shadow-none hover:bg-[var(--color-base-200)]"
                aria-label={`${p.handle} 인스타그램 @${p.instagram}`}
              >
                <InstagramIcon className="w-3.5 h-3.5" />@{p.instagram}
              </a>
            </div>
          ) : null}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        <section className="card border border-[var(--color-base-300)] bg-[var(--color-base-100)] shadow-sm">
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
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds. No unused import warnings for `Image` or `photoBadgeTone`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/season/[seasonNo]/[gender]/[handle]/page.tsx"
git commit -m "feat: simplify participant detail page to single column, remove photo"
```

---

### Task 9: Sources URL Decode & Portrait Notice

**Files:**
- Modify: `src/entities/participant/ui/ParticipantDetailsSections.tsx`

- [ ] **Step 1: Add portrait notice; decode source URLs**

Replace the sources section (lines 90–110 in the current file) from:

```tsx
{p.sources.length > 0 ? (
  <section className="mt-5">
    <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-base-content/55">
      출처
    </h2>
    <ul className="space-y-2">
      {p.sources.map((url) => (
        <li key={url} className="text-sm">
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
```

to:

```tsx
{p.sources.length > 0 ? (
  <section className="mt-5">
    <p className="mb-3 text-sm leading-relaxed text-base-content/60">
      📷 출연자 사진은 초상권 보호를 위해 게재하지 않습니다.
      아래 출처 링크에서 확인하실 수 있습니다.
    </p>
    <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-base-content/55">
      출처
    </h2>
    <ul className="space-y-2">
      {p.sources.map((url) => (
        <li key={url} className="text-sm">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="link link-primary break-all"
          >
            {decodeURIComponent(url)}
          </a>
        </li>
      ))}
    </ul>
  </section>
) : null}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds. `decodeURIComponent` is a global — no import needed.

- [ ] **Step 3: Commit**

```bash
git add src/entities/participant/ui/ParticipantDetailsSections.tsx
git commit -m "feat: add portrait rights notice and decode source URLs"
```

---

### Task 10: Final Verification

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: Build succeeds. 402+ static pages generated, zero TypeScript errors.

- [ ] **Step 2: Visual check in browser**

Run: `npm run dev` then open http://localhost:3000

Verify each item:
- [ ] Cream background (`#F5F0E8`), charcoal text — no more yellow/green daisyUI bumblebee
- [ ] Noto Serif KR loaded for titles, Noto Sans KR for body
- [ ] Season chip grid with numbers 1–30, selected chip inverted (dark bg)
- [ ] Cards are compact horizontal blocks — no photo placeholder anywhere
- [ ] Card shows `35세 (1992년생)` for participants with birthYear
- [ ] Card hides age line for participants where birthYear is null
- [ ] No Hero banner, no Archive Status section, no Season Rail at bottom
- [ ] Navigate to detail page `/season/30/m/영수` — single column, no photo
- [ ] Portrait rights notice appears above the 출처 section
- [ ] Source URLs show decoded Korean characters (e.g., `나는솔로-30기-영수-프로필` not `%EB%82%98%EB%8A%94...`)
- [ ] Footer has "출연자 사진은 초상권 보호를 위해 게재하지 않습니다." line
- [ ] Dark mode (click theme toggle) — deep navy background, coral female accents

- [ ] **Step 3: Commit any last-minute fixes**

```bash
git add -A
git commit -m "fix: post-review visual tweaks"
```
