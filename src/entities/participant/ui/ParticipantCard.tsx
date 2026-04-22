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
  const accentLineClass = isMale ? "bg-info" : "bg-secondary";

  const content = (
    <div
      className={`surface-card rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`.trim()}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[11px] font-semibold text-base-content/50">
          {p.seasonNo}기
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${accentBadgeClass}`}
        >
          {isMale ? "남" : "여"}
        </span>
      </div>

      <h3 className="font-(--font-title) text-xl tracking-tight leading-tight">
        {p.handle}
      </h3>

      {p.profile.job ? (
        <p className="mt-1 text-sm text-base-content/65">
          {p.profile.job}
        </p>
      ) : null}

      {metaParts.length > 0 ? (
        <p className="mt-1.5 text-[11px] text-base-content/45">
          {metaParts.join(" · ")}
        </p>
      ) : null}

      <div
        className={`h-[2px] w-full mt-3 rounded-full ${accentLineClass}`}
        aria-hidden="true"
      />
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
