import Link from 'next/link';
import type { Participant } from '../model/schemas';
import { getParticipantUrl } from '../lib/helpers';

interface Props {
  participant: Participant;
  age: string;
  finalChoiceParticipant?: Participant | null;
  showGender?: boolean;
  showInstagramInFacts?: boolean;
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

      {p.sources.length > 0 ? (
        <section className="mt-5">
          <p className="mb-3 text-sm leading-relaxed text-base-content/60">
            📷 출연자 사진은 초상권 보호를 위해 게재하지 않습니다.
            아래 출처 링크에서 확인하실 수 있습니다.
          </p>
          <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-base-content/55">
            출처
          </h2>
          <ul className="space-y-2">
            {p.sources.map((url) => {
              let displayUrl = url;
              try {
                displayUrl = decodeURIComponent(url);
              } catch {
                // If decoding fails, use the original URL
              }
              return (
                <li key={url} className="text-sm">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary break-all"
                  >
                    {displayUrl}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
