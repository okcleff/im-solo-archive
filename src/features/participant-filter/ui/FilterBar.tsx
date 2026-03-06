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
    <div className="bg-white dark:bg-slate-900 border-b border-[#E8E7E3] dark:border-slate-700 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
        {/* 성별 필터 */}
        <div role="group" aria-label="성별 필터" className="flex gap-1.5 shrink-0">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              onClick={() => onGenderChange(g.value)}
              aria-pressed={gender === g.value}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400
                ${
                  gender === g.value
                    ? 'bg-[#111] dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-[#EEEDE9] dark:bg-slate-700 text-[#555] dark:text-slate-300 hover:bg-[#E2E1DC] dark:hover:bg-slate-600'
                }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* 검색 */}
        <div className="relative flex-1 min-w-[180px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="이름, 직업, 지역 검색…"
            aria-label="출연자 검색"
            className="w-full pl-9 pr-8 py-1.5 text-sm rounded-full
              border border-[#E0DFD9] dark:border-slate-600
              bg-[#F5F4F0] dark:bg-slate-800
              text-[#111] dark:text-slate-100
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-slate-400 focus:border-transparent transition-all"
          />
          {query && (
            <button
              onClick={() => { onQueryChange(''); inputRef.current?.focus(); }}
              aria-label="검색어 지우기"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
