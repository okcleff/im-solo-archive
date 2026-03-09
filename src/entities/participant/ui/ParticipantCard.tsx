'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Participant } from '../model/schemas';
import { getParticipantUrl } from '../lib/helpers';
import { calcKoreanAge } from '@/shared/lib/utils';

interface Props {
  participant: Participant;
  onClick?: () => void;
  /** true면 클릭 시 상세 페이지로 직접 이동 (시즌 페이지에서 사용) */
  asLink?: boolean;
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

export default function ParticipantCard({ participant: p, onClick, asLink = false }: Props) {
  const href = getParticipantUrl(p);
  const isMale = p.gender === 'M';
  const age = calcKoreanAge(p.profile.birthYear);

  // 이름 길이에 따라 글자 크기 조정
  const nameFontSize =
    p.handle.length <= 2 ? 'text-5xl sm:text-6xl' :
    p.handle.length <= 3 ? 'text-4xl sm:text-5xl' :
    'text-3xl sm:text-4xl';

  const meta = [p.profile.region, age !== '미공개' ? age : null].filter(Boolean).join(' · ');

  const content = (
    <>
      {/* ─── 비주얼 블록 ─── */}
      <div
        className={`
          relative aspect-[3/4] overflow-hidden rounded-2xl
          shadow-[0_2px_16px_rgba(0,0,0,0.08)]
          group-hover:shadow-[0_24px_56px_rgba(0,0,0,0.22)]
          transition-shadow duration-500
          ${isMale ? 'bg-[#0d1525]' : 'bg-[#160710]'}
        `}
      >
        {p.photo.src ? (
          <Image
            src={p.photo.src}
            alt={p.photo.alt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <>
            {/* 미묘한 방사형 글로우 */}
            <div
              className={`absolute inset-0 ${
                isMale
                  ? 'bg-[radial-gradient(ellipse_at_50%_110%,#1e3a8a1a_0%,transparent_60%)]'
                  : 'bg-[radial-gradient(ellipse_at_50%_110%,#9f12341a_0%,transparent_60%)]'
              }`}
            />

            {/* 기수 라벨 — 상단 왼쪽 */}
            <span className="absolute top-4 left-4 text-[10px] text-white/25 font-medium tracking-[0.2em] uppercase">
              {p.seasonNo}기
            </span>

            {/* 이름 — 카드의 시각적 히어로 */}
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <span
                className={`font-black text-white/90 tracking-tight text-center leading-[0.88] ${nameFontSize}`}
              >
                {p.handle}
              </span>
            </div>
          </>
        )}

        {/* ── 호버 시 정보 패널: 아래에서 슬라이드업 ── */}
        <div
          className="
            absolute inset-x-0 bottom-0 pt-10 pb-4 px-4
            bg-gradient-to-t from-black/92 via-black/65 to-transparent
            translate-y-full group-hover:translate-y-0
            transition-transform duration-500 ease-spring
          "
        >
          {p.profile.job && (
            <p className="text-white text-sm font-semibold leading-snug">{p.profile.job}</p>
          )}
          {meta && (
            <p className="text-white/45 text-xs mt-1">{meta}</p>
          )}
          {p.profile.traits.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {p.profile.traits.slice(0, 3).map((t, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-white/15 text-white/70 px-2 py-0.5 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 인스타그램 아이콘 (우상단, 호버 시 나타남) */}
        {p.instagram && (
          <a
            href={`https://instagram.com/${p.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${p.handle} 인스타그램`}
            onClick={(e) => e.stopPropagation()}
            className="
              absolute top-3 right-3 w-7 h-7 rounded-full
              bg-white/10 backdrop-blur-sm
              flex items-center justify-center text-white
              opacity-0 group-hover:opacity-100
              scale-90 group-hover:scale-100
              transition-all duration-300 hover:bg-white/25
            "
          >
            <InstagramIcon className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* ─── 텍스트 영역 ─── */}
      <div className="pt-3">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-[#111] dark:text-slate-100 text-sm tracking-tight truncate">{p.handle}</h3>
          {p.instagram && (
            <a
              href={`https://instagram.com/${p.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${p.handle} 인스타그램`}
              onClick={(e) => e.stopPropagation()}
              className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0"
            >
              <InstagramIcon className="w-3 h-3" />
            </a>
          )}
        </div>
        {p.profile.job && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{p.profile.job}</p>
        )}
      </div>
    </>
  );

  if (asLink) {
    return (
      <article>
        <Link href={href} className="block group">
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
        onClick={onClick}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
        aria-label={`${p.handle} 상세 정보 보기`}
        className="group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded-2xl"
      >
        {content}
      </div>
    </article>
  );
}
