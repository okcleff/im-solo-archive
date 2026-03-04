'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Participant } from '../model/types';
import { getParticipantUrl, getParticipantSummary } from '../lib/helpers';

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
  const summary = getParticipantSummary(p);
  const href = getParticipantUrl(p);

  const photoArea = (
    <div
      className={`
        relative aspect-[3/4] rounded-2xl overflow-hidden mb-2.5
        shadow-sm group-hover:shadow-lg transition-shadow duration-200
        ${p.gender === 'M'
          ? 'bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900'
          : 'bg-gradient-to-br from-rose-300 via-rose-500 to-rose-700'
        }
      `}
    >
      {p.photo.src ? (
        <Image
          src={p.photo.src}
          alt={p.photo.alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white select-none">
          <div className="text-6xl font-black opacity-20 leading-none">{p.handle[0]}</div>
          <div className="text-2xl font-bold mt-2 drop-shadow">{p.handle}</div>
          <div className="text-xs opacity-60 mt-1">{p.seasonNo}기</div>
        </div>
      )}

      {/* 성별 배지 */}
      <div className="absolute top-2 left-2">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm
            ${p.gender === 'M' ? 'bg-blue-900/70 text-blue-100' : 'bg-rose-900/70 text-rose-100'}`}
        >
          {p.gender === 'M' ? '남' : '여'}
        </span>
      </div>

      {/* 인스타그램 아이콘 (값 있을 때만 표시) */}
      {p.instagram && (
        <a
          href={`https://instagram.com/${p.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${p.handle} 인스타그램`}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40
            backdrop-blur-sm flex items-center justify-center text-white transition-colors"
        >
          <InstagramIcon className="w-3.5 h-3.5" />
        </a>
      )}

      {/* 호버 오버레이 */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
    </div>
  );

  const textArea = (
    <div className="px-0.5">
      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
        {p.handle}
        {p.instagram && (
          <a
            href={`https://instagram.com/${p.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${p.handle} 인스타그램`}
            onClick={(e) => e.stopPropagation()}
            className="text-slate-400 hover:text-rose-500 transition-colors"
          >
            <InstagramIcon className="w-3 h-3" />
          </a>
        )}
      </h3>
      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{summary}</p>
    </div>
  );

  if (asLink) {
    return (
      <article>
        <Link href={href} className="block group">
          {photoArea}
          {textArea}
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
        className="block group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded-2xl"
      >
        {photoArea}
        {textArea}
      </div>
    </article>
  );
}
