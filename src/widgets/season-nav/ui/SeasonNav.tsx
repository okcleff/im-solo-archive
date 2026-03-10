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
    <div ref={containerRef} className={`dropdown dropdown-end ${open ? 'dropdown-open' : ''}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="기수별 페이지 열기"
        className="btn btn-ghost btn-sm border border-base-300"
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
        <div className="menu dropdown-content mt-2 w-[280px] rounded-2xl glass-panel p-3 shadow-2xl z-50 animate-float-in">
          <p className="px-2 pb-2 text-[10px] uppercase tracking-[0.18em] text-base-content/55">
            전체 기수 ({seasons.length})
          </p>

          <div className="grid grid-cols-5 gap-2 max-h-[58vh] overflow-y-auto pr-1 pt-1">
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
                      ? 'btn btn-primary btn-sm h-10 min-h-10 rounded-xl px-0'
                      : 'btn btn-ghost btn-sm h-10 min-h-10 rounded-xl border border-base-300 px-0'
                  }
                >
                  {isLatest && !isCurrent ? (
                    <span className="absolute -top-1.5 -right-1.5 badge badge-secondary badge-xs">
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
