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
        <div className="flex justify-end">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-(--color-base-content)/50 hover:text-base-content transition-colors cursor-pointer"
          >
            {expanded ? "접기 ▲" : "전체 보기 ▼"}
          </button>
        </div>

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
                className={`rounded-lg border py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  active
                    ? "border-(--color-base-content) bg-(--color-base-content) text-(--color-base-100)"
                    : "border-(--color-base-300) bg-(--color-base-100) text-base-content hover:border-(--color-base-content)/40 hover:bg-(--color-base-200)"
                }`}
              >
                {s.seasonNo}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
