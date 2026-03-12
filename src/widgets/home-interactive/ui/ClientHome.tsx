"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Season, Participant } from "@/entities/participant";
import { ParticipantCard } from "@/entities/participant";
import { SeasonTabs } from "@/features/season-select";
import { FilterBar, filterParticipants } from "@/features/participant-filter";
import { ParticipantModal } from "@/widgets/participant-modal";

const NOTICE_STORAGE_KEY = "notice-dismissed-v1";

interface Props {
  seasons: Season[];
}

function getEpisodeRange(season: Season) {
  const first = season.episodes[0]?.ep;
  const last = season.episodes.at(-1)?.ep;
  if (!first) return "";
  return first === last ? `EP${first}` : `EP${first}-${last}`;
}

function ParticipantBoard({
  title,
  tone,
  participants,
  onSelect,
}: {
  title: string;
  tone: "info" | "error";
  participants: Participant[];
  onSelect: (participant: Participant) => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`badge badge-${tone} badge-sm`} />
          <h2 className="section-title !text-base-content/72">{title}</h2>
        </div>
        <span className="badge badge-outline badge-sm">
          {participants.length}명
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {participants.map((participant) => (
          <ParticipantCard
            key={`${participant.seasonNo}-${participant.gender}-${participant.handle}`}
            participant={participant}
            onClick={() => onSelect(participant)}
            variant="editorial"
            className="h-full"
          />
        ))}
      </div>
    </section>
  );
}

export default function ClientHome({ seasons }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const selectedSeasonNo = Number(
    searchParams.get("season") ?? seasons[0].seasonNo,
  );
  const selectedGender = searchParams.get("gender") ?? "all";
  const searchQuery = searchParams.get("q") ?? "";
  const hasQuery = searchQuery.trim().length > 0;

  const [modalParticipant, setModalParticipant] = useState<Participant | null>(
    null,
  );
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(NOTICE_STORAGE_KEY) !== "true") {
      setShowNotice(true);
    }
  }, []);

  const handleDismissForever = () => {
    localStorage.setItem(NOTICE_STORAGE_KEY, "true");
    setShowNotice(false);
  };

  const currentSeason =
    seasons.find((s) => s.seasonNo === selectedSeasonNo) ?? seasons[0];
  const searchScopeParticipants = hasQuery
    ? seasons.flatMap((s) => s.participants)
    : currentSeason.participants;

  const filtered = filterParticipants(
    searchScopeParticipants,
    selectedGender,
    searchQuery,
  );
  const males = filtered.filter((p) => p.gender === "M");
  const females = filtered.filter((p) => p.gender === "F");

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (!v || v === "all") params.delete(k);
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-14">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-32 self-start">
            <div className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body gap-5">
                <div>
                  <p className="section-title">current lens</p>
                  <h2 className="mt-3 font-[var(--font-title)] text-3xl tracking-tight">
                    {hasQuery
                      ? "전체 검색 모드"
                      : `나는 SOLO ${currentSeason.seasonNo}기`}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-base-content/64">
                    {hasQuery
                      ? `"${searchQuery}"에 맞는 출연자를 모든 시즌에서 다시 큐레이션합니다.`
                      : `${currentSeason.label} · ${getEpisodeRange(currentSeason)} 기준 보드입니다.`}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="soft-stat p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-base-content/45">
                      results
                    </p>
                    <p className="mt-2 text-3xl font-semibold">
                      {filtered.length}
                    </p>
                    <p className="mt-1 text-sm text-base-content/58">
                      {selectedGender === "all"
                        ? "남녀 전체"
                        : selectedGender === "M"
                          ? "남성만"
                          : "여성만"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="soft-stat p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-base-content/45">
                        male
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {males.length}
                      </p>
                    </div>
                    <div className="soft-stat p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-base-content/45">
                        female
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {females.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-base-200/80 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-base-content/45">
                    navigation
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="badge badge-outline">시즌 선택</span>
                    <span className="badge badge-outline">즉시 검색</span>
                    <span className="badge badge-outline">성별 필터</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-10">
            {filtered.length === 0 ? (
              <div className="alert border border-base-300 bg-base-100 shadow-sm">
                <span>검색 결과가 없습니다.</span>
              </div>
            ) : selectedGender === "all" ? (
              <>
                {males.length > 0 ? (
                  <ParticipantBoard
                    title="men's board"
                    tone="info"
                    participants={males}
                    onSelect={setModalParticipant}
                  />
                ) : null}
                {females.length > 0 ? (
                  <ParticipantBoard
                    title="women's board"
                    tone="error"
                    participants={females}
                    onSelect={setModalParticipant}
                  />
                ) : null}
              </>
            ) : (
              <ParticipantBoard
                title={selectedGender === "M" ? "men's board" : "women's board"}
                tone={selectedGender === "M" ? "info" : "error"}
                participants={filtered}
                onSelect={setModalParticipant}
              />
            )}
          </div>
        </div>
      </div>

      {modalParticipant ? (
        <ParticipantModal
          participant={modalParticipant}
          onClose={() => setModalParticipant(null)}
        />
      ) : null}

      {showNotice ? (
        <div
          className="modal modal-open px-4"
          onClick={() => setShowNotice(false)}
        >
          <div
            className="modal-box border border-base-300 bg-base-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold">안내</h2>
              <p className="text-sm leading-relaxed text-base-content/70">
                이 사이트는{" "}
                <span className="font-semibold text-base-content">
                  vibe coding
                </span>
                으로 제작된 비공식 팬 아카이브입니다. 출연진 정보에 누락이나
                오류가 있을 수 있습니다.
              </p>
              <p className="text-sm leading-relaxed text-base-content/70">
                보완·정정·제보 및 사이트 제안사항은 아래 메일로 보내주세요.
              </p>
              <a
                href="mailto:imsoloarchive@gmail.com"
                className="link link-primary text-sm break-all"
              >
                imsoloarchive@gmail.com
              </a>
            </div>
            <div className="modal-action mt-5">
              <button
                onClick={handleDismissForever}
                className="btn btn-outline"
              >
                다시 보지 않기
              </button>
              <button
                onClick={() => setShowNotice(false)}
                className="btn btn-primary"
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
