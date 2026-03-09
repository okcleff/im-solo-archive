'use client';

import { useRef } from 'react';

interface Props {
  gender: string;
  query: string;
  onGenderChange: (g: string) => void;
  onQueryChange: (q: string) => void;
}

const GENDERS = [
  { value: 'all', label: '전체' },
  { value: 'M', label: '남' },
  { value: 'F', label: '여' },
];

export default function FilterBar({ gender, query, onGenderChange, onQueryChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="px-4 pt-3">
      <div className="max-w-6xl mx-auto surface rounded-2xl p-3 sm:p-4 flex flex-wrap items-center gap-3">
        <div role="group" aria-label="성별 필터" className="flex gap-1.5">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              onClick={() => onGenderChange(g.value)}
              aria-pressed={gender === g.value}
              className={
                gender === g.value
                  ? 'px-3.5 py-1.5 rounded-xl text-sm font-semibold bg-[color:var(--fg)] text-white dark:bg-[color:var(--accent)]'
                  : 'px-3.5 py-1.5 rounded-xl text-sm font-semibold chip hover:text-[color:var(--fg)] transition-colors'
              }
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[180px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="이름, 직업, 지역 검색"
            aria-label="출연자 검색"
            className="w-full pl-9 pr-9 h-10 rounded-xl border border-[color:var(--line)]
              bg-[color:var(--surface-strong)] text-sm
              placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          />
          {query ? (
            <button
              onClick={() => {
                onQueryChange('');
                inputRef.current?.focus();
              }}
              aria-label="검색어 지우기"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[color:var(--fg)] text-lg leading-none"
            >
              x
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
