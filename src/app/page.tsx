import type { Metadata } from "next";
import { SEASONS_DATA, SHOW_INFO } from "@/entities/participant/server";
import { buildHomeJsonLd } from "@/entities/participant";
import { getSiteUrl } from "@/shared/config/site";
import JsonLd from "@/shared/ui/JsonLd";
import { ClientHome } from "@/widgets/home-interactive";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: `나는 SOLO(나는 솔로) 역대 기수별 출연자 아카이브 | 출연자 프로필 총정리`,
  description: `나는 솔로(나는 SOLO·나는솔로) 역대 출연자를 기수별로 총정리. 1기부터 최신 기수까지 출연자 직업, 나이, 지역, 특징을 한눈에 검색하세요.`,
  alternates: { canonical: BASE },
  openGraph: {
    title: `나는 SOLO(나는 솔로) 역대 기수별 출연자 아카이브`,
    description:
      "나는 솔로(나는 SOLO) 역대 출연자를 기수별로 검색하고 비교하세요. 직업·나이·지역·특징 총정리.",
    url: BASE,
  },
};

const latestSeason = SEASONS_DATA[0];
const totalParticipants = SEASONS_DATA.reduce(
  (sum, s) => sum + s.participants.length,
  0,
);

const FAQ = [
  {
    q: "나는 SOLO 역대 기수는 몇 기까지 있나요?",
    a: `나는 SOLO는 현재 ${latestSeason.seasonNo}기까지 방영되었으며, 본 아카이브는 1기부터 ${latestSeason.seasonNo}기까지 역대 출연자 정보를 기수별로 모두 정리하고 있습니다.`,
  },
  {
    q: "나는 SOLO 기수별 출연자는 어디서 볼 수 있나요?",
    a: "홈 상단의 기수 탭에서 원하는 기수를 선택하면 해당 기수 출연자 목록을 볼 수 있고, 기수별 페이지에서 남녀 출연자 프로필을 각각 확인할 수 있습니다.",
  },
  {
    q: "출연자 정보는 어떤 내용이 정리되어 있나요?",
    a: `각 출연자의 직업, 나이, 지역, 특징과 방영 중 이슈를 정리했습니다. 현재 역대 출연자 약 ${totalParticipants}명의 프로필을 검색·비교할 수 있습니다.`,
  },
  {
    q: "특정 출연자를 이름으로 검색할 수 있나요?",
    a: "네. 홈 화면 검색창에 이름을 입력하면 역대 기수 전체에서 해당 출연자를 찾을 수 있고, 성별 필터로 남녀 출연자를 구분해 볼 수 있습니다.",
  },
];

const homeJsonLd = buildHomeJsonLd({
  base: BASE,
  showInfo: SHOW_INFO,
  seasons: SEASONS_DATA,
  faq: FAQ,
});

interface Props {
  searchParams: Promise<{ season?: string; gender?: string; q?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const latestSeasonNo = SEASONS_DATA[0].seasonNo;
  const initialSeasonNo = Number(params.season ?? latestSeasonNo);
  const initialGender = params.gender ?? "all";
  const initialQuery = params.q ?? "";

  return (
    <>
      <JsonLd data={homeJsonLd} />

      <header className="max-w-6xl mx-auto px-4 pt-8 pb-2">
        <h1 className="text-2xl sm:text-3xl font-(--font-title) tracking-tight">
          나는 SOLO 역대 기수별 출연자 아카이브
        </h1>
        <p className="mt-2 max-w-3xl text-sm sm:text-base text-base-content/68">
          1기부터 최신 {latestSeason.seasonNo}기까지, 나는 솔로(나는 SOLO·나는솔로)
          역대 출연자를 기수별로 정리했습니다. 출연자 직업·나이·지역·특징을 한눈에
          검색하고 비교해 보세요.
        </p>
      </header>

      <div className="max-w-6xl mx-auto">
        <ClientHome
          seasons={SEASONS_DATA}
          initialSeasonNo={initialSeasonNo}
          initialGender={initialGender}
          initialQuery={initialQuery}
        />
      </div>

      <section
        aria-labelledby="faq-heading"
        className="max-w-6xl mx-auto px-4 pb-12 mt-12"
      >
        <h2
          id="faq-heading"
          className="text-xl sm:text-2xl font-(--font-title) tracking-tight mb-4"
        >
          자주 묻는 질문
        </h2>
        <div className="space-y-2">
          {FAQ.map((item) => (
            <details key={item.q} className="surface-card px-4 py-3">
              <summary className="cursor-pointer font-semibold text-sm sm:text-base">
                {item.q}
              </summary>
              <p className="mt-2 text-sm text-base-content/72">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
