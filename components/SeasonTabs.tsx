'use client';

import type { Season } from '@/lib/types';

interface Props {
  seasons: Season[];
  selectedSeasonNo: number;
  onChange: (seasonNo: number) => void;
}

export default function SeasonTabs({ seasons, selectedSeasonNo, onChange }: Props) {
  return (
    <div className="border-b border-slate-200 bg-white sticky top-14 z-30">
      <div className="max-w-6xl mx-auto px-4">
        <div role="tablist" className="flex gap-0 overflow-x-auto scrollbar-hide">
          {seasons.map((s) => {
            const active = s.seasonNo === selectedSeasonNo;
            return (
              <button
                key={s.seasonNo}
                role="tab"
                aria-selected={active}
                onClick={() => onChange(s.seasonNo)}
                className={`
                  px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400
                  ${
                    active
                      ? 'border-rose-500 text-rose-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }
                `}
              >
                {s.seasonNo}기
                <span
                  className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
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
