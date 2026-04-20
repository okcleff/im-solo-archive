"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Season, Participant } from "@/entities/participant";
import { ParticipantCard } from "@/entities/participant";
import { SeasonTabs } from "@/features/season-select";
import { FilterBar, filterParticipants } from "@/features/participant-filter";

const NOTICE_STORAGE_KEY = "notice-dismissed-v1";

interface Props {
  seasons: Season[];
}

function ParticipantBoard({
  title,
  tone,
  participants,
  onSelect,
}: {
  title: string;
  tone: "info" | "secondary";
  participants: Participant[];
  onSelect: (participant: Participant) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              tone === "info" ? "bg-info" : "bg-secondary"
            }`}
          />
          <h2 className="section-title">{title}</h2>
        </div>
        <span className="text-xs text-base-content/45">
          {participants.length}명
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {participants.map((participant) => (
          <ParticipantCard
            key={`${participant.seasonNo}-${participant.gender}-${participant.handle}`}
            participant={participant}
            onClick={() => onSelect(participant)}
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

  const filtered = filterParticipants(searchScopeParticipants, selectedGender, searchQuery);
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-14 space-y-8">
        {filtered.length === 0 ? (
          <p className="text-sm text-base-content/55 py-12 text-center">
            검색 결과가 없습니다.
          </p>
        ) : selectedGender === "all" ? (
          <>
            {males.length > 0 && (
              <ParticipantBoard
                title="남성 출연자"
                tone="info"
                participants={males}
                onSelect={(p) => router.push(`/season/${p.seasonNo}/${p.gender.toLowerCase()}/${p.handle}`)}
              />
            )}
            {females.length > 0 && (
              <ParticipantBoard
                title="여성 출연자"
                tone="secondary"
                participants={females}
                onSelect={(p) => router.push(`/season/${p.seasonNo}/${p.gender.toLowerCase()}/${p.handle}`)}
              />
            )}
          </>
        ) : (
          <ParticipantBoard
            title={selectedGender === "M" ? "남성 출연자" : "여성 출연자"}
            tone={selectedGender === "M" ? "info" : "secondary"}
            participants={filtered}
            onSelect={(p) => router.push(`/season/${p.seasonNo}/${p.gender.toLowerCase()}/${p.handle}`)}
          />
        )}
      </div>

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
                className="btn btn-outline btn-sm"
              >
                다시 보지 않기
              </button>
              <button
                onClick={() => setShowNotice(false)}
                className="btn btn-primary btn-sm"
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
