'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { Participant } from '@/entities/participant';
import { getParticipantUrl, SourceConfidenceLegend } from '@/entities/participant';
import { calcKoreanAge } from '@/shared/lib/utils';

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
    document.body.style.overflow = 'hidden';
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
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;
      const focusables = Array.from(
        modal.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'),
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const accentGrad = p.gender === 'M' ? 'from-blue-600 to-indigo-700' : 'from-rose-500 to-red-600';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-modal-overlay"
      onClick={(e) => e.target === overlayRef.current && onClose()}
      aria-modal="true"
      role="dialog"
      aria-label={`${p.handle} 상세 정보`}
    >
      <div
        ref={modalRef}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl surface-strong shadow-2xl animate-modal-content"
      >
        <div className={`bg-gradient-to-r ${accentGrad} text-white p-6`}>
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <div className="text-white/80 text-xs mb-1">나는 SOLO {p.seasonNo}기 · {p.gender === 'M' ? '남' : '여'}</div>
              <h2 className="text-3xl font-[var(--font-title)] tracking-tight">{p.handle}</h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {p.instagram ? (
                <a
                  href={`https://instagram.com/${p.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${p.handle} 인스타그램 (@${p.instagram})`}
                  className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              ) : null}
              <button
                data-autofocus
                onClick={onClose}
                aria-label="모달 닫기"
                className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <dl className="grid grid-cols-2 gap-3 rounded-2xl chip p-4">
            <InfoItem label="나이" value={age} />
            <InfoItem label="직업" value={p.profile.job} />
            <InfoItem label="지역" value={p.profile.region} />
            {p.instagram ? (
              <div>
                <dt className="text-[10px] font-bold text-muted uppercase tracking-wider">인스타그램</dt>
                <dd className="mt-0.5 text-sm">
                  <a
                    href={`https://instagram.com/${p.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--accent)] underline underline-offset-2 hover:no-underline"
                  >
                    @{p.instagram}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>

          {p.profile.traits.length > 0 ? (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 text-muted">특징</h3>
              <div className="flex flex-wrap gap-2">
                {p.profile.traits.map((t, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold chip">{t}</span>
                ))}
              </div>
            </div>
          ) : null}

          {p.profile.notableQuotes.length > 0 ? (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 text-muted">화제 멘트</h3>
              <ul className="space-y-2">
                {p.profile.notableQuotes.map((q, i) => (
                  <li key={i} className="text-sm italic rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2">
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {p.profile.issues.length > 0 ? (
            <div className="rounded-2xl p-4 border border-amber-300/60 bg-amber-100/60 dark:bg-amber-950/30 dark:border-amber-900">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-amber-700 dark:text-amber-400">이슈 / 미확인 정보</h3>
              <ul className="space-y-1.5">
                {p.profile.issues.map((issue, i) => (
                  <li key={i} className="text-xs text-amber-800 dark:text-amber-200">- {issue}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {p.sources.length > 0 ? (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 text-muted">출처</h3>
              <ul className="space-y-2.5">
                {p.sources.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span
                      aria-hidden="true"
                      className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        s.confidence === 'high' ? 'bg-emerald-500' : s.confidence === 'medium' ? 'bg-amber-500' : 'bg-rose-400'
                      }`}
                    />
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[color:var(--accent)] underline underline-offset-2 hover:no-underline">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="px-6 pb-6 pt-1 flex justify-between items-center border-t border-[color:var(--line)]">
          <SourceConfidenceLegend />
          <Link href={getParticipantUrl(p)} className="text-xs font-semibold text-[color:var(--accent)] hover:opacity-80">
            개별 페이지 보기
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-[10px] font-bold text-muted uppercase tracking-wider">{label}</dt>
      <dd className="text-sm mt-0.5 font-medium">{value ?? '미공개'}</dd>
    </div>
  );
}
