'use client';

import { useEffect, useRef } from 'react';
import type { Season } from '@/entities/participant';

interface Props {
  seasons: Season[];
  selectedSeasonNo: number;
  onChange: (seasonNo: number) => void;
}

export default function SeasonTabs({ seasons, selectedSeasonNo, onChange }: Props) {
  const activeRef = useRef<HTMLButtonElement>(null);

  // 마운트 및 시즌 변경 시 활성 탭을 뷰에 스크롤
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [selectedSeasonNo]);

  return (
    <div className="border-b border-slate-200 bg-white sticky top-14 z-30">
      <div className="max-w-6xl mx-auto px-4">
        <div
          role="tablist"
          aria-label="기수 선택"
          className="flex gap-0 overflow-x-auto scrollbar-hide"
        >
          {seasons.map((s) => {
            const active = s.seasonNo === selectedSeasonNo;
            return (
              <button
                key={s.seasonNo}
                ref={active ? activeRef : undefined}
                role="tab"
                aria-selected={active}
                onClick={() => onChange(s.seasonNo)}
                className={`
                  shrink-0 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-inset
                  ${
                    active
                      ? 'border-rose-500 text-rose-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }
                `}
              >
                {s.seasonNo}기
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {s.participants.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
