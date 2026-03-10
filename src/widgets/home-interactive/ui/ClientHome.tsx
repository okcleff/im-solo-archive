'use client';

import { useState, useCallback, useTransition, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Season, Participant } from '@/entities/participant';
import { ParticipantCard } from '@/entities/participant';
import { SeasonTabs } from '@/features/season-select';
import { FilterBar, filterParticipants } from '@/features/participant-filter';
import { ParticipantModal } from '@/widgets/participant-modal';

const NOTICE_STORAGE_KEY = 'notice-dismissed-v1';

interface Props {
  seasons: Season[];
}

export default function ClientHome({ seasons }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const selectedSeasonNo = Number(searchParams.get('season') ?? seasons[0].seasonNo);
  const selectedGender = searchParams.get('gender') ?? 'all';
  const searchQuery = searchParams.get('q') ?? '';
  const hasQuery = searchQuery.trim().length > 0;

  const [modalParticipant, setModalParticipant] = useState<Participant | null>(null);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(NOTICE_STORAGE_KEY) !== 'true') {
      setShowNotice(true);
    }
  }, []);

  const handleDismissForever = () => {
    localStorage.setItem(NOTICE_STORAGE_KEY, 'true');
    setShowNotice(false);
  };

  const currentSeason = seasons.find((s) => s.seasonNo === selectedSeasonNo) ?? seasons[0];
  const searchScopeParticipants = hasQuery
    ? seasons.flatMap((s) => s.participants)
    : currentSeason.participants;

  const filtered = filterParticipants(searchScopeParticipants, selectedGender, searchQuery);
  const males = filtered.filter((p) => p.gender === 'M');
  const females = filtered.filter((p) => p.gender === 'F');

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (!v || v === 'all') params.delete(k);
        else params.set(k, v);
      }
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  return (
    <>
      <SeasonTabs
        seasons={seasons}
        selectedSeasonNo={currentSeason.seasonNo}
        onChange={(no) => updateParams({ season: String(no), q: null })}
      />

      <FilterBar
        gender={selectedGender}
        query={searchQuery}
        onGenderChange={(g) => updateParams({ gender: g })}
        onQueryChange={(q) => updateParams({ q })}
      />

      <div className="px-4 sm:px-6 pt-6 pb-2 max-w-6xl mx-auto">
        <p className="text-xs text-muted">
          {hasQuery ? `전체 기수 검색 · ${filtered.length}명` : `${currentSeason.label} · ${filtered.length}명`}
          {searchQuery ? <span className="ml-2 text-[color:var(--accent)]">"{searchQuery}" 검색 결과</span> : null}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted text-sm">검색 결과가 없습니다.</div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 space-y-10">
          {selectedGender === 'all' ? (
            <>
              {males.length > 0 ? (
                <section>
                  <h2 className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted mb-4 flex items-center gap-2">
                    <span className="w-1 h-3 bg-blue-500 rounded-full" />남 ({males.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                    {males.map((p) => (
                      <ParticipantCard
                        key={`${p.seasonNo}-${p.gender}-${p.handle}`}
                        participant={p}
                        onClick={() => setModalParticipant(p)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
              {females.length > 0 ? (
                <section>
                  <h2 className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted mb-4 flex items-center gap-2">
                    <span className="w-1 h-3 bg-rose-500 rounded-full" />여 ({females.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                    {females.map((p) => (
                      <ParticipantCard
                        key={`${p.seasonNo}-${p.gender}-${p.handle}`}
                        participant={p}
                        onClick={() => setModalParticipant(p)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filtered.map((p) => (
                <ParticipantCard
                  key={`${p.seasonNo}-${p.gender}-${p.handle}`}
                  participant={p}
                  onClick={() => setModalParticipant(p)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {modalParticipant ? (
        <ParticipantModal participant={modalParticipant} onClose={() => setModalParticipant(null)} />
      ) : null}

      {showNotice ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowNotice(false)}
        >
          <div
            className="bg-[var(--surface-strong)] border border-[var(--line)] rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-bold text-[var(--foreground)]">안내</h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                이 사이트는 <span className="font-semibold text-[var(--foreground)]">vibe coding</span>으로 제작된 비공식 팬 아카이브입니다.
                출연진 정보에 누락이나 오류가 있을 수 있습니다.
              </p>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                보완·정정·제보 및 사이트 제안사항은 아래 메일로 보내주세요.
              </p>
              <a
                href="mailto:imsoloarchive@gmail.com"
                className="text-sm font-medium text-[var(--accent)] hover:underline break-all"
              >
                imsoloarchive@gmail.com
              </a>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleDismissForever}
                className="flex-1 py-2 text-sm rounded-xl border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)] transition-colors"
              >
                다시 보지 않기
              </button>
              <button
                onClick={() => setShowNotice(false)}
                className="flex-1 py-2 text-sm rounded-xl bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
