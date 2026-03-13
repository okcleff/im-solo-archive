import Link from 'next/link';
import type { Participant } from '../model/schemas';
import { getParticipantUrl } from '../lib/helpers';
import SourceConfidenceLegend from './SourceConfidenceLegend';

interface Props {
  participant: Participant;
  age: string;
  finalChoiceParticipant?: Participant | null;
  showGender?: boolean;
  showInstagramInFacts?: boolean;
  showLegend?: boolean;
  className?: string;
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
        {value ?? '미공개'}
      </dd>
    </div>
  );
}

export default function ParticipantDetailsSections({
  participant: p,
  age,
  finalChoiceParticipant = null,
  showGender = false,
  showInstagramInFacts = false,
  showLegend = false,
  className,
}: Props) {
  return (
    <div className={className}>
      <dl className="stats stats-vertical sm:stats-horizontal w-full border border-base-300 bg-base-200/70 shadow-sm">
        <InfoItem label="나이" value={age} />
        <InfoItem label="직업" value={p.profile.job} />
        <InfoItem label="지역" value={p.profile.region} />
        <div className="stat">
          <dt className="stat-title text-[10px] font-bold uppercase tracking-wider">
            최종 선택
          </dt>
          <dd className="stat-value mt-0 text-sm font-medium">
            {p.finalChoice ? (
              finalChoiceParticipant ? (
                <Link
                  href={getParticipantUrl(finalChoiceParticipant)}
                  className="link link-primary"
                >
                  {p.finalChoice}
                </Link>
              ) : (
                p.finalChoice
              )
            ) : (
              '선택 안 함'
            )}
          </dd>
        </div>
        {showGender ? (
          <InfoItem label="성별" value={p.gender === 'M' ? '남' : '여'} />
        ) : null}
        {showInstagramInFacts && p.instagram ? (
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
        <section className="mt-5">
          <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-base-content/55">
            특징
          </h2>
          <div className="flex flex-wrap gap-2">
            {p.profile.traits.map((trait, index) => (
              <span key={`${trait}-${index}`} className="badge badge-outline h-8 px-3">
                {trait}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {p.profile.notableQuotes.length > 0 ? (
        <section className="mt-5">
          <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-base-content/55">
            화제 멘트
          </h2>
          <ul className="space-y-2">
            {p.profile.notableQuotes.map((quote, index) => (
              <li
                key={`${quote}-${index}`}
                className="rounded-2xl border border-base-300 bg-base-200/60 px-4 py-3 text-sm italic shadow-sm"
              >
                {quote}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {p.profile.issues.length > 0 ? (
        <section className="mt-5 alert border border-warning/30 bg-warning/12 text-warning-content">
          <div className="block">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-warning">
              이슈 / 미확인 정보
            </h2>
            <ul className="space-y-1.5">
              {p.profile.issues.map((issue, index) => (
                <li key={`${issue}-${index}`} className="text-xs opacity-90">
                  - {issue}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {p.sources.length > 0 ? (
        <section className="mt-5">
          <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-base-content/55">
            출처
          </h2>
          <ul className="space-y-2.5">
            {p.sources.map((source, index) => (
              <li key={`${source.url}-${index}`} className="flex items-start gap-2 text-sm">
                <span
                  aria-hidden="true"
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    source.confidence === 'high'
                      ? 'bg-emerald-500'
                      : source.confidence === 'medium'
                        ? 'bg-amber-500'
                        : 'bg-rose-400'
                  }`}
                />
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
          {showLegend ? <SourceConfidenceLegend className="mt-4" /> : null}
        </section>
      ) : null}
    </div>
  );
}
