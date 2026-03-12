"use client";

import { useEffect, useRef } from "react";
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
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedSeasonNo]);

  return (
    <div className="sticky top-16 z-30 px-4 pt-3">
      <div className="max-w-6xl mx-auto">
        <div className="glass-panel rounded-[1.75rem] p-3">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <p className="section-title">season rail</p>
            <span className="badge badge-outline badge-sm">
              {seasons.length} seasons
            </span>
          </div>
          <div
            role="tablist"
            aria-label="기수 선택"
            className="carousel carousel-center w-full gap-3 overflow-x-auto scrollbar-hide pb-1 pt-1"
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
                  className={`carousel-item card w-[9.75rem] shrink-0 border text-left transition-all duration-300 cursor-pointer ${
                    active
                      ? "border-primary bg-primary text-primary-content shadow-lg shadow-primary/20"
                      : "border-base-300 bg-base-100 hover:-translate-y-0.5 hover:border-base-content/15 hover:shadow-md"
                  }`}
                >
                  <div className="card-body gap-2 p-4">
                    <div
                      className={`text-[10px] uppercase tracking-[0.24em] ${active ? "text-primary-content/70" : "text-base-content/45"}`}
                    >
                      season
                    </div>
                    <div className="flex items-end justify-between">
                      <strong className="font-[var(--font-title)] text-3xl leading-none">
                        {s.seasonNo}
                      </strong>
                      <span
                        className={`text-xs ${active ? "text-primary-content/70" : "text-base-content/55"}`}
                      >
                        {s.participants.length}명
                      </span>
                    </div>
                    <div
                      className={`line-clamp-2 text-xs leading-relaxed ${active ? "text-primary-content/80" : "text-base-content/65"}`}
                    >
                      {s.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
