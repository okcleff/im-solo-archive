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
  variant?: 'editorial' | 'compact';
  featured?: boolean;
  className?: string;
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

export default function ParticipantCard({
  participant: p,
  onClick,
  asLink = false,
  variant = 'compact',
  featured = false,
  className = '',
}: Props) {
  const href = getParticipantUrl(p);
  const isMale = p.gender === 'M';
  const age = calcKoreanAge(p.profile.birthYear);
  const meta = [p.profile.region, age !== '미공개' ? age : null].filter(Boolean).join(' · ');
  const accentBadge = isMale ? 'badge-accent' : 'badge-secondary';
  const accentLine = isMale ? 'bg-accent' : 'bg-secondary';
  const accentText = isMale ? 'text-accent' : 'text-secondary';
  const traitPreview = p.profile.traits.slice(0, variant === 'editorial' ? 3 : 2);
  const cardClasses = variant === 'editorial'
    ? 'card h-full overflow-hidden border border-base-300 bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'
    : 'card h-full overflow-hidden border border-base-300 bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg';
  const figureClasses = variant === 'editorial'
    ? 'relative aspect-[4/5] overflow-hidden bg-base-200'
    : 'relative aspect-[4/5] overflow-hidden bg-base-200';

  const content = (
    <div className={`${cardClasses} ${className}`.trim()}>
      <div className={figureClasses}>
        {p.photo.src ? (
          <Image
            src={p.photo.src}
            alt={p.photo.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-base-200 text-base-content">
            <div className="text-center px-4">
              <span className="block text-[10px] uppercase tracking-[0.34em] text-base-content/35">SOLO ARCHIVE</span>
              <strong className="mt-3 block text-6xl font-[var(--font-title)] leading-none tracking-tight text-base-content/15">
                {p.seasonNo}
              </strong>
              <span className="mt-3 inline-flex rounded-full border border-base-300 bg-base-100 px-3 py-1 text-xs font-semibold">
                {p.handle}
              </span>
            </div>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="badge badge-neutral border-none bg-base-100/85 text-[11px] text-base-content shadow-sm">
            {p.seasonNo}기
          </span>
          <span className={`badge border-none text-[11px] shadow-sm ${accentBadge}`}>
            {isMale ? '남' : '여'}
          </span>
        </div>
      </div>
      <div className={`h-1 w-full ${accentLine}`} aria-hidden="true" />

      <div className={`card-body ${variant === 'editorial' ? 'gap-4 p-5' : 'gap-3 p-4'}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={`font-[var(--font-title)] tracking-tight text-base-content ${variant === 'editorial' ? 'text-xl' : 'text-lg'}`}>
              {p.handle}
            </h3>
            <p className="mt-1 text-sm font-medium text-base-content/78">
              {p.profile.job ?? '직업 미공개'}
            </p>
            <p className={`mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${accentText}`}>
              {isMale ? 'male participant' : 'female participant'}
            </p>
          </div>
          {p.instagram ? (
            <a
              href={`https://instagram.com/${p.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${p.handle} 인스타그램`}
              onClick={(e) => e.stopPropagation()}
              className="btn btn-circle btn-ghost btn-sm border border-base-300"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
          ) : null}
        </div>

        {meta ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/58">
            {meta.split(' · ').map((item) => (
              <span key={item} className="rounded-full bg-base-200 px-2.5 py-1 font-medium">
                {item}
              </span>
            ))}
          </div>
        ) : null}

        {traitPreview.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {traitPreview.map((trait) => (
              <span key={trait} className="badge badge-outline h-7 px-3">
                {trait}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-base-content/55">프로필 요약 준비 중</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-base-300/80 pt-3">
          <span className="text-xs uppercase tracking-[0.2em] text-base-content/45">
            participant profile
          </span>
          <span className="btn btn-ghost btn-xs px-0 text-primary">
            상세 보기
          </span>
        </div>
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
        className="group cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {content}
      </div>
    </article>
  );
}
