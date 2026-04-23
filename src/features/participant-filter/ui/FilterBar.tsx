"use client";

import { useRef, useState, useEffect } from "react";
import { trackSearch } from "@/shared/analytics/events";

interface Props {
  gender: string;
  query: string;
  onGenderChange: (g: string) => void;
  onQueryChange: (q: string) => void;
}

const GENDERS = [
  { value: "all", label: "전체" },
  { value: "M", label: "남" },
  { value: "F", label: "여" },
];

export default function FilterBar({
  gender,
  query,
  onGenderChange,
  onQueryChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localQuery, setLocalQuery] = useState(query);
  const isComposingRef = useRef(false);

  const submitQuery = () => {
    const trimmed = localQuery.trim();
    onQueryChange(trimmed);
    trackSearch(trimmed);
  };

  useEffect(() => {
    if (!isComposingRef.current) {
      setLocalQuery(query);
    }
  }, [query]);

  return (
    <div className="px-4 pt-3">
      <div className="max-w-6xl mx-auto glass-panel rounded-2xl p-3 sm:p-4 flex flex-wrap items-center gap-3">
        <div role="group" aria-label="성별 필터" className="join">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              onClick={() => onGenderChange(g.value)}
              aria-pressed={gender === g.value}
              className={
                gender === g.value
                  ? "btn btn-primary join-item btn-sm"
                  : "btn btn-ghost join-item btn-sm border border-base-300"
              }
            >
              {g.label}
            </button>
          ))}
        </div>

        <form
          className="relative flex-1 min-w-[180px]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isComposingRef.current) submitQuery();
          }}
        >
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/45 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={(e) => {
              isComposingRef.current = false;
              const v = e.currentTarget.value;
              setLocalQuery(v);
            }}
            onChange={(e) => {
              const v = e.target.value;
              setLocalQuery(v);
            }}
            placeholder="이름·직업·지역"
            aria-label="출연자 검색"
            className="input input-bordered w-full pl-3 pr-18 text-sm"
          />
          <button
            type="submit"
            aria-label="검색 실행"
            className="btn btn-ghost btn-xs absolute right-2 top-1/2 -translate-y-1/2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </button>
          {localQuery ? (
            <button
              type="button"
              onClick={() => {
                setLocalQuery("");
                onQueryChange("");
                inputRef.current?.focus();
              }}
              aria-label="검색어 지우기"
              className="btn btn-ghost btn-xs absolute right-9 top-1/2 -translate-y-1/2 text-base-content/60"
            >
              ×
            </button>
          ) : null}
        </form>
      </div>
    </div>
  );
}
