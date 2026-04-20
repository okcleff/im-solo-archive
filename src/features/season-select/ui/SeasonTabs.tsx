"use client";

import { useState } from "react";
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
  const [expanded, setExpanded] = useState(false);
  const sorted = [...seasons].sort((a, b) => b.seasonNo - a.seasonNo);

  return (
    <div className="px-4 pt-5 pb-2">
      <div className="max-w-6xl mx-auto space-y-2">
        <div
          role="tablist"
          aria-label="기수 선택"
          className={`grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 overflow-hidden transition-[max-height] duration-300 ease-in-out ${
            expanded ? "max-h-[500px]" : "max-h-[42px]"
          }`}
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

        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-[var(--color-base-content)]/50 hover:text-[var(--color-base-content)] transition-colors"
        >
          {expanded ? "접기 ▲" : "전체 보기 ▼"}
        </button>
      </div>
    </div>
  );
}
