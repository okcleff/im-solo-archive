'use client';

import { useState, useCallback, useTransition } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Season, Participant } from '@/entities/participant';
import { ParticipantCard } from '@/entities/participant';
import { SeasonTabs } from '@/features/season-select';
import { FilterBar, filterParticipants } from '@/features/participant-filter';
import { ParticipantModal } from '@/widgets/participant-modal';

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

  const [modalParticipant, setModalParticipant] = useState<Participant | null>(null);

  const currentSeason = seasons.find((s) => s.seasonNo === selectedSeasonNo) ?? seasons[0];
  const filtered = filterParticipants(currentSeason.participants, selectedGender, searchQuery);
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

      <div className="px-4 sm:px-6 pt-6 pb-3 max-w-6xl mx-auto">
        <p className="text-xs text-[#999]">
          {currentSeason.label} · {filtered.length}명
          {searchQuery && (
            <span className="ml-2 text-rose-500">&ldquo;{searchQuery}&rdquo; 검색 결과</span>
          )}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-[#bbb] text-sm">검색 결과가 없습니다.</div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 space-y-10">
          {selectedGender === 'all' ? (
            <>
              {males.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold tracking-[0.18em] uppercase text-[#999] mb-4 flex items-center gap-2">
                    <span className="w-1 h-3 bg-blue-500 rounded-full" />남 ({males.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                    {males.map((p) => (
                      <ParticipantCard
                        key={`${p.seasonNo}-${p.gender}-${p.handle}`}
                        participant={p}
                        onClick={() => setModalParticipant(p)}
                      />
                    ))}
                  </div>
                </section>
              )}
              {females.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold tracking-[0.18em] uppercase text-[#999] mb-4 flex items-center gap-2">
                    <span className="w-1 h-3 bg-rose-500 rounded-full" />여 ({females.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                    {females.map((p) => (
                      <ParticipantCard
                        key={`${p.seasonNo}-${p.gender}-${p.handle}`}
                        participant={p}
                        onClick={() => setModalParticipant(p)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
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

      {modalParticipant && (
        <ParticipantModal
          participant={modalParticipant}
          onClose={() => setModalParticipant(null)}
        />
      )}
    </>
  );
}
