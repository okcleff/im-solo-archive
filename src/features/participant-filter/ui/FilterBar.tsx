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
    <div className="bg-white border-b border-slate-100 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
        {/* 성별 필터 */}
        <div role="group" aria-label="성별 필터" className="flex gap-1.5 shrink-0">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              onClick={() => onGenderChange(g.value)}
              aria-pressed={gender === g.value}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400
                ${
                  gender === g.value
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* 검색 */}
        <div className="relative flex-1 min-w-[180px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
            className="w-full pl-9 pr-8 py-1.5 text-sm rounded-full border border-slate-200 bg-slate-50
              focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
          />
          {query && (
            <button
              onClick={() => { onQueryChange(''); inputRef.current?.focus(); }}
              aria-label="검색어 지우기"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
