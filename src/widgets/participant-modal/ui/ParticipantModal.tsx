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

  // 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // 이전 포커스 저장 및 복원
  useEffect(() => {
    prevFocusRef.current = document.activeElement as HTMLElement;
    return () => { prevFocusRef.current?.focus(); };
  }, []);

  // 포커스 트랩 + ESC 닫기
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;

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

  const accent = p.gender === 'M' ? 'from-[#1C2B4A] to-[#070E1D]' : 'from-[#C01442] to-[#7F0E2C]';
  const accentBadge = p.gender === 'M'
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300';
  const accentText = p.gender === 'M'
    ? 'text-blue-700 dark:text-blue-400'
    : 'text-rose-600 dark:text-rose-400';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-modal-overlay"
      onClick={(e) => e.target === overlayRef.current && onClose()}
      aria-modal="true"
      role="dialog"
      aria-label={`${p.handle} 상세 정보`}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto animate-modal-content"
      >
        {/* 헤더 */}
        <div className={`bg-gradient-to-r ${accent} text-white p-6 rounded-t-3xl sm:rounded-t-2xl`}>
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <div className="text-white/70 text-xs font-medium mb-1">
                나는 SOLO {p.seasonNo}기 · {p.gender === 'M' ? '남' : '여'}
              </div>
              <h2 className="text-3xl font-bold">{p.handle}</h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* 인스타그램 링크 (값 있을 때만) */}
              {p.instagram && (
                <a
                  href={`https://instagram.com/${p.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${p.handle} 인스타그램 (@${p.instagram})`}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center
                    text-white transition-colors"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {/* 닫기 버튼 */}
              <button
                data-autofocus
                onClick={onClose}
                aria-label="모달 닫기"
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center
                  text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-5">
          {/* 기본 정보 */}
          <dl className="grid grid-cols-2 gap-3">
            <InfoItem label="나이" value={age} />
            <InfoItem label="직업" value={p.profile.job} />
            <InfoItem label="지역" value={p.profile.region} />
            {p.instagram && (
              <div>
                <dt className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">인스타그램</dt>
                <dd className="mt-0.5">
                  <a
                    href={`https://instagram.com/${p.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${p.instagram} 인스타그램 (새 탭에서 열림)`}
                    className="text-sm text-rose-600 dark:text-rose-400 underline hover:no-underline font-medium"
                  >
                    @{p.instagram}
                  </a>
                </dd>
              </div>
            )}
          </dl>

          {/* 특징 */}
          {p.profile.traits.length > 0 && (
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${accentText}`}>특징</h3>
              <div className="flex flex-wrap gap-2">
                {p.profile.traits.map((t, i) => (
                  <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${accentBadge}`}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* 화제 멘트 */}
          {p.profile.notableQuotes.length > 0 && (
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${accentText}`}>화제 멘트</h3>
              <ul className="space-y-2">
                {p.profile.notableQuotes.map((q, i) => (
                  <li key={i} className="text-sm text-slate-700 dark:text-slate-300 italic border-l-4 border-rose-300 dark:border-rose-700 pl-3 py-0.5">{q}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 이슈 */}
          {p.profile.issues.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/50 rounded-xl p-4 border border-amber-200 dark:border-amber-900">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-amber-700 dark:text-amber-400">이슈 / 미확인 정보</h3>
              <ul className="space-y-1.5">
                {p.profile.issues.map((issue, i) => (
                  <li key={i} className="text-xs text-amber-800 dark:text-amber-300 flex gap-2"><span aria-hidden="true">⚠</span><span>{issue}</span></li>
                ))}
              </ul>
            </div>
          )}

          {/* 출처 */}
          {p.sources.length > 0 && (
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${accentText}`}>출처</h3>
              <ul className="space-y-2.5">
                {p.sources.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      role="img"
                      aria-label={s.confidence === 'high' ? '고신뢰' : s.confidence === 'medium' ? '중간 신뢰' : '낮은 신뢰'}
                      className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        s.confidence === 'high' ? 'bg-green-500' : s.confidence === 'medium' ? 'bg-yellow-500' : 'bg-red-400'
                      }`}
                    />
                    <a href={s.url} target="_blank" rel="noopener noreferrer"
                      aria-label={`${s.title} (새 탭에서 열림)`}
                      className="text-xs text-blue-600 dark:text-blue-400 underline hover:no-underline leading-relaxed">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 pb-6 pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-700">
          <SourceConfidenceLegend />
          <Link href={getParticipantUrl(p)}
            className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors">
            개별 페이지 →
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</dt>
      <dd className="text-sm text-slate-800 dark:text-slate-100 mt-0.5 font-medium">{value ?? '미공개'}</dd>
    </div>
  );
}
