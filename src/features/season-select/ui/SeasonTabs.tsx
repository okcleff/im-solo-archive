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

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [selectedSeasonNo]);

  return (
    <div className="sticky top-16 z-30 px-4 pt-3">
      <div className="max-w-6xl mx-auto">
        <div role="tablist" aria-label="기수 선택" className="surface rounded-2xl p-1.5 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {seasons.map((s) => {
            const active = s.seasonNo === selectedSeasonNo;
            return (
              <button
                key={s.seasonNo}
                ref={active ? activeRef : undefined}
                role="tab"
                aria-selected={active}
                onClick={() => onChange(s.seasonNo)}
                className={
                  active
                    ? 'shrink-0 px-3 py-2 rounded-xl text-sm font-semibold bg-[color:var(--accent)] text-white'
                    : 'shrink-0 px-3 py-2 rounded-xl text-sm font-semibold text-muted hover:text-[color:var(--fg)] chip transition-colors'
                }
              >
                {s.seasonNo}기
                <span className={active ? 'ml-1.5 text-[10px] text-white/80' : 'ml-1.5 text-[10px] text-muted'}>
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
