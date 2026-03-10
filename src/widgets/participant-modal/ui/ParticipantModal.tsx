"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { Participant } from "@/entities/participant";
import {
  getParticipantUrl,
  SourceConfidenceLegend,
} from "@/entities/participant";
import { calcKoreanAge } from "@/shared/lib/utils";

interface Props {
  participant: Participant;
  onClose: () => void;
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function ParticipantModal({ participant: p, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  const age = calcKoreanAge(p.profile.birthYear);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    prevFocusRef.current = document.activeElement as HTMLElement;
    return () => {
      prevFocusRef.current?.focus();
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const modal = modalRef.current;
      if (!modal) return;
      const focusables = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (
        e.shiftKey
          ? document.activeElement === first
          : document.activeElement === last
      ) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    modalRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const accentGrad =
    p.gender === "M" ? "from-accent to-primary" : "from-secondary to-primary";

  return (
    <div
      ref={overlayRef}
      className="modal modal-open animate-modal-overlay"
      onClick={(e) => e.target === overlayRef.current && onClose()}
      aria-modal="true"
      role="dialog"
      aria-label={`${p.handle} 상세 정보`}
    >
      <div
        ref={modalRef}
        className="modal-box w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-base-100 p-0 shadow-2xl animate-modal-content"
      >
        <div className={`bg-gradient-to-r ${accentGrad} text-white p-6`}>
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <div className="text-white/80 text-xs mb-1">
                나는 SOLO {p.seasonNo}기 · {p.gender === "M" ? "남" : "여"}
              </div>
              <h2 className="text-3xl font-[var(--font-title)] tracking-tight">
                {p.handle}
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {p.instagram ? (
                <a
                  href={`https://instagram.com/${p.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${p.handle} 인스타그램 (@${p.instagram})`}
                  className="btn btn-square btn-sm border-none bg-white/20 text-white hover:bg-white/30"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              ) : null}
              <button
                data-autofocus
                onClick={onClose}
                aria-label="모달 닫기"
                className="btn btn-square btn-sm border-none bg-white/20 text-white hover:bg-white/30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <dl className="stats stats-vertical sm:stats-horizontal w-full border border-base-300 bg-base-200/70 shadow-sm">
            <InfoItem label="나이" value={age} />
            <InfoItem label="직업" value={p.profile.job} />
            <InfoItem label="지역" value={p.profile.region} />
            {p.instagram ? (
              <div className="stat">
                <dt className="stat-title text-[10px] font-bold uppercase tracking-wider">
                  인스타그램
                </dt>
                <dd className="stat-value mt-0 text-sm font-medium">
                  <a
                    href={`https://instagram.com/${p.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary"
                  >
                    @{p.instagram}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>

          {p.profile.traits.length > 0 ? (
            <div>
              <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-base-content/55">
                특징
              </h3>
              <div className="flex flex-wrap gap-2">
                {p.profile.traits.map((t, i) => (
                  <span key={i} className="badge badge-outline h-8 px-3">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {p.profile.notableQuotes.length > 0 ? (
            <div>
              <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-base-content/55">
                화제 멘트
              </h3>
              <ul className="space-y-2">
                {p.profile.notableQuotes.map((q, i) => (
                  <li
                    key={i}
                    className="rounded-2xl border border-base-300 bg-base-200/60 px-4 py-3 text-sm italic shadow-sm"
                  >
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {p.profile.issues.length > 0 ? (
            <div className="alert border border-warning/30 bg-warning/12 text-warning-content">
              <div className="block">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-warning">
                  이슈 / 미확인 정보
                </h3>
                <ul className="space-y-1.5">
                  {p.profile.issues.map((issue, i) => (
                    <li key={i} className="text-xs opacity-90">
                      - {issue}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {p.sources.length > 0 ? (
            <div>
              <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-base-content/55">
                출처
              </h3>
              <ul className="space-y-2.5">
                {p.sources.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span
                      aria-hidden="true"
                      className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        s.confidence === "high"
                          ? "bg-emerald-500"
                          : s.confidence === "medium"
                            ? "bg-amber-500"
                            : "bg-rose-400"
                      }`}
                    />
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-base-300 px-6 pb-6 pt-1">
          <SourceConfidenceLegend />
          <Link
            href={getParticipantUrl(p)}
            className="btn btn-ghost btn-sm text-primary"
          >
            개별 페이지 보기
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="stat">
      <dt className="stat-title text-[10px] font-bold uppercase tracking-wider">
        {label}
      </dt>
      <dd className="stat-value mt-0 text-sm font-medium">
        {value ?? "미공개"}
      </dd>
    </div>
  );
}
