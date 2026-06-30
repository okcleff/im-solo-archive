"use client";

import Link from "next/link";
import type { Participant } from "../model/schemas";
import { formatAgeWithBirthYear } from "../lib/age";
import { getParticipantUrl } from "../lib/helpers";
import { getCurrentYear } from "@/shared/lib/utils";
import { trackParticipantCardClick } from "@/shared/analytics/events";

interface Props {
  participant: Participant;
  onClick?: () => void;
  asLink?: boolean;
  className?: string;
}

export default function ParticipantCard({
  participant: p,
  onClick,
  asLink = false,
  className = "",
}: Props) {
  const href = getParticipantUrl(p);
  const isMale = p.gender === "M";
  const ageText = formatAgeWithBirthYear(p.profile.birthYear, getCurrentYear());
  const metaParts = [p.profile.region, ageText].filter(Boolean);
  const accentBadgeClass = isMale
    ? "bg-info text-info-content"
    : "bg-secondary text-secondary-content";
  const monogramClass = isMale
    ? "border-info/30 bg-info/10 text-info"
    : "border-secondary/30 bg-secondary/10 text-secondary";
  const accentBarClass = isMale ? "bg-info" : "bg-secondary";
  const initial = Array.from(p.handle)[0] ?? "";

  const content = (
    <div
      className={`surface-card relative overflow-hidden rounded-xl p-4 pl-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`.trim()}
    >
      <span
        className={`absolute inset-y-0 left-0 w-1 ${accentBarClass}`}
        aria-hidden="true"
      />

      <div className="flex items-start gap-3">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border font-(--font-title) text-lg ${monogramClass}`}
          aria-hidden="true"
        >
          {initial}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-base-content/50">
              {p.seasonNo}기
            </span>
            <span
              className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${accentBadgeClass}`}
            >
              {isMale ? "남" : "여"}
            </span>
          </div>
          <h3 className="mt-0.5 font-(--font-title) text-xl tracking-tight leading-tight truncate">
            {p.handle}
          </h3>
        </div>
      </div>

      {p.profile.job ? (
        <p className="mt-3 text-sm text-base-content/70">{p.profile.job}</p>
      ) : null}

      {metaParts.length > 0 ? (
        <p className="mt-1 text-[11px] text-base-content/45">
          {metaParts.join(" · ")}
        </p>
      ) : null}
    </div>
  );

  if (asLink) {
    return (
      <article>
        <Link
          href={href}
          className="block"
          onClick={() => trackParticipantCardClick(p.seasonNo, p.handle, p.gender)}
        >
          {content}
        </Link>
      </article>
    );
  }

  return (
    <article>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          trackParticipantCardClick(p.seasonNo, p.handle, p.gender);
          onClick?.();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            trackParticipantCardClick(p.seasonNo, p.handle, p.gender);
            onClick?.();
          }
        }}
        aria-label={`${p.handle} 상세 정보 보기`}
        className="cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {content}
      </div>
    </article>
  );
}
