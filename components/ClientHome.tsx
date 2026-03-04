'use client';

import { useState, useCallback, useTransition } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Season, Participant } from '@/lib/types';
import { filterParticipants } from '@/lib/utils';
import SeasonTabs from './SeasonTabs';
import FilterBar from './FilterBar';
import ParticipantCard from './ParticipantCard';
import ParticipantModal from './ParticipantModal';

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

  const currentSeason =
    seasons.find((s) => s.seasonNo === selectedSeasonNo) ?? seasons[0];

  const filtered = filterParticipants(currentSeason.participants, selectedGender, searchQuery);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === '' || v === 'all') {
          params.delete(k);
        } else {
          params.set(k, v);
        }
      }
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  const handleSeasonChange = (seasonNo: number) => {
    updateParams({ season: String(seasonNo), q: null });
  };

  const handleGenderChange = (g: string) => updateParams({ gender: g });
  const handleQueryChange = (q: string) => updateParams({ q });

  const males = filtered.filter((p) => p.gender === 'M');
  const females = filtered.filter((p) => p.gender === 'F');

  return (
    <>
      <SeasonTabs
        seasons={seasons}
        selectedSeasonNo={currentSeason.seasonNo}
        onChange={handleSeasonChange}
      />

      <FilterBar
        gender={selectedGender}
        query={searchQuery}
        onGenderChange={handleGenderChange}
        onQueryChange={handleQueryChange}
      />

      <div className="px-4 pt-6 pb-2 max-w-6xl mx-auto">
        <p className="text-sm text-slate-400">
          {currentSeason.label} · {filtered.length}명
          {searchQuery && (
            <span className="ml-2 text-rose-500">
              &ldquo;{searchQuery}&rdquo; 검색 결과
            </span>
          )}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          검색 결과가 없습니다.
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 pb-8 space-y-8">
          {/* Show all or grouped by gender */}
          {selectedGender === 'all' ? (
            <>
              {males.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold text-blue-600 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    남 ({males.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                  <h2 className="text-sm font-bold text-rose-500 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-rose-500 rounded-full" />
                    여 ({females.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
