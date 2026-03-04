'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Season } from '@/entities/participant';

interface Props {
  seasons: Season[];
  /** 현재 경로의 시즌 번호 (해당 시즌 하이라이트용) */
  currentSeasonNo?: number;
}

export default function SeasonNav({ seasons, currentSeasonNo }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const latestSeasonNo = seasons[0]?.seasonNo;

  const close = useCallback(() => setOpen(false), []);

  // 외부 클릭 / ESC 닫기
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
        className="flex items-center gap-1 text-sm text-slate-300 hover:text-white transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded px-1"
      >
        기수별
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100
            p-4 z-50 min-w-[220px]"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
            전체 기수 ({seasons.length}개)
          </p>

          {/* 기수 그리드: 4열, 많은 기수도 스크롤 대응 */}
          <div className="grid grid-cols-4 gap-1.5 max-h-[60vh] overflow-y-auto pr-0.5">
            {seasons.map((s) => {
              const isLatest = s.seasonNo === latestSeasonNo;
              const isCurrent = s.seasonNo === currentSeasonNo;
              return (
                <Link
                  key={s.seasonNo}
                  href={`/season/${s.seasonNo}`}
                  onClick={close}
                  className={`
                    relative flex flex-col items-center justify-center rounded-xl py-2.5 px-1 text-xs font-semibold
                    transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400
                    ${
                      isCurrent
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                    }
                  `}
                >
                  {isLatest && !isCurrent && (
                    <span className="absolute -top-1.5 -right-1 text-[8px] bg-rose-500 text-white px-1 rounded-full leading-4">
                      최신
                    </span>
                  )}
                  {s.seasonNo}기
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
