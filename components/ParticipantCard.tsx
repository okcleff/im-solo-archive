'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Participant } from '@/lib/types';
import { getParticipantUrl, getParticipantSummary } from '@/lib/utils';

interface Props {
  participant: Participant;
  /** 클릭 시 모달 열기 (홈 페이지에서 사용) */
  onClick?: () => void;
  /** true면 직접 상세 페이지로 이동 (시즌 페이지에서 사용) */
  asLink?: boolean;
}

export default function ParticipantCard({ participant: p, onClick, asLink = false }: Props) {
  const summary = getParticipantSummary(p);
  const href = getParticipantUrl(p);

  const Wrapper = asLink
    ? ({ children }: { children: React.ReactNode }) => (
        <Link href={href} className="block group cursor-pointer">
          {children}
        </Link>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <div
          role="button"
          tabIndex={0}
          onClick={onClick}
          onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
          aria-label={`${p.handle} 상세 정보 보기`}
          className="block group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded-2xl"
        >
          {children}
        </div>
      );

  return (
    <article>
      <Wrapper>
        {/* Photo / Placeholder */}
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

          {/* Gender badge */}
          <div className="absolute top-2 left-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm
                ${p.gender === 'M' ? 'bg-blue-900/70 text-blue-100' : 'bg-rose-900/70 text-rose-100'}`}
            >
              {p.gender === 'M' ? '남' : '여'}
            </span>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
        </div>

        {/* Text */}
        <div className="px-0.5">
          <h3 className="font-bold text-slate-900 text-sm">{p.handle}</h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{summary}</p>
        </div>
      </Wrapper>
    </article>
  );
}
