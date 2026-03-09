'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Participant } from '../model/schemas';
import { getParticipantUrl } from '../lib/helpers';
import { calcKoreanAge } from '@/shared/lib/utils';

interface Props {
  participant: Participant;
  onClick?: () => void;
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
  const meta = [p.profile.region, age !== '미공개' ? age : null].filter(Boolean).join(' · ');

  const content = (
    <div className="surface rounded-2xl p-2 sm:p-2.5 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 transition-all">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
        {p.photo.src ? (
          <Image
            src={p.photo.src}
            alt={p.photo.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className={`absolute inset-0 ${isMale ? 'bg-gradient-to-br from-blue-600 to-slate-900' : 'bg-gradient-to-br from-rose-500 to-slate-900'} grid place-items-center`}>
            <div className="text-center px-3">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-white/70">{p.seasonNo}기</span>
              <strong className="block text-3xl sm:text-4xl text-white font-[var(--font-title)] mt-1 tracking-tight">{p.handle}</strong>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-white font-semibold truncate">{p.profile.job ?? '직업 미공개'}</p>
            {p.instagram ? (
              <a
                href={`https://instagram.com/${p.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${p.handle} 인스타그램`}
                onClick={(e) => e.stopPropagation()}
                className="w-6 h-6 rounded-full bg-white/20 text-white grid place-items-center"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
            ) : null}
          </div>
          {meta ? <p className="text-[11px] text-white/70 mt-0.5 truncate">{meta}</p> : null}
        </div>
      </div>

      <div className="px-1 pt-3 pb-1">
        <h3 className="font-semibold tracking-tight text-sm">{p.handle}</h3>
        {p.profile.traits.length > 0 ? (
          <p className="text-xs text-muted mt-1 line-clamp-2">{p.profile.traits.slice(0, 2).join(' · ')}</p>
        ) : (
          <p className="text-xs text-muted mt-1">프로필 요약 준비 중</p>
        )}
      </div>
    </div>
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
        className="group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] rounded-2xl"
      >
        {content}
      </div>
    </article>
  );
}
