'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Season } from '@/entities/participant';

interface Props {
  seasons: Season[];
  currentSeasonNo?: number;
}

export default function SeasonNav({ seasons, currentSeasonNo }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const latestSeasonNo = seasons[0]?.seasonNo;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open, close]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="기수별 페이지 열기"
        className="h-9 px-3 rounded-xl text-sm border border-[color:var(--line)]
          bg-[color:var(--surface-strong)] text-muted hover:text-[color:var(--fg)]
          inline-flex items-center gap-1.5 transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
      >
        기수
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.25}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 p-3 w-[250px] rounded-2xl surface shadow-2xl z-50 animate-float-in">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted mb-2 px-1">
            전체 기수 ({seasons.length})
          </p>

          <div className="grid grid-cols-5 gap-1.5 max-h-[58vh] overflow-y-auto pr-0.5">
            {seasons.map((s) => {
              const isLatest = s.seasonNo === latestSeasonNo;
              const isCurrent = s.seasonNo === currentSeasonNo;
              return (
                <Link
                  key={s.seasonNo}
                  href={`/season/${s.seasonNo}`}
                  onClick={close}
                  className={
                    isCurrent
                      ? 'relative h-9 rounded-xl text-xs font-semibold grid place-items-center bg-[color:var(--accent)] text-white'
                      : 'relative h-9 rounded-xl text-xs font-semibold grid place-items-center chip hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--fg)] transition-colors'
                  }
                >
                  {isLatest && !isCurrent ? (
                    <span className="absolute -top-1.5 -right-1.5 text-[8px] leading-[1] px-1.5 py-1 rounded-full bg-[color:var(--accent-2)] text-white">
                      N
                    </span>
                  ) : null}
                  {s.seasonNo}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
