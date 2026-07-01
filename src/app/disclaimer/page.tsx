import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/shared/config/site";

const BASE = getSiteUrl();
const CONTACT_EMAIL = "imsoloarchive@gmail.com";

export const metadata: Metadata = {
  title: "면책조항 및 저작권 안내",
  description:
    "나는 SOLO 아카이브는 공개된 정보를 바탕으로 한 비공식 팬 아카이브입니다. 제휴 관계, 저작권, 정보 정정·삭제 안내.",
  alternates: { canonical: `${BASE}/disclaimer` },
  robots: { index: true, follow: true },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-base-content">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-base-content/75">
        {children}
      </div>
    </section>
  );
}

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-(--font-title) tracking-tight">
        면책조항 및 저작권 안내
      </h1>
      <p className="mt-4 text-sm sm:text-base leading-relaxed text-base-content/75">
        본 사이트는 방송 및 언론 보도 등 공개된 정보를 바탕으로 정리한
        비공식 팬 아카이브입니다. 방송사, 제작사 및 관련 기관과 아무런 제휴
        관계가 없으며, 상표권 및 저작권은 각 권리자에게 귀속됩니다.
      </p>

      <Section title="정보의 정확성">
        <p>
          사이트에 게시된 정보는 공개된 자료를 바탕으로 정리한 것으로, 누락이나
          오류가 있을 수 있습니다. 게시 내용은 정보 제공을 목적으로 하며, 그
          정확성이나 완전성을 보증하지 않습니다.
        </p>
      </Section>

      <Section title="초상권 및 저작권">
        <p>
          출연자의 초상(사진)은 게재하지 않으며, 확인이 필요한 경우 각 프로필의
          출처 링크를 통해 안내합니다. 인용된 상표·명칭·저작물의 권리는 모두 각
          권리자에게 있습니다.
        </p>
      </Section>

      <Section title="정보의 정정 · 삭제 요청">
        <p>
          게시된 정보에 오류가 있거나 정정·삭제가 필요한 경우, 당사자 또는
          관계자께서는 아래 이메일로 연락해 주시면 확인 후 신속히 조치하겠습니다.
        </p>
        <p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="link link-primary">
            {CONTACT_EMAIL}
          </a>
        </p>
      </Section>

      <p className="mt-10 text-xs text-base-content/55">
        개인정보 처리에 관한 사항은{" "}
        <Link href="/privacy" className="link link-primary">
          개인정보처리방침
        </Link>
        을, 사이트 소개는{" "}
        <Link href="/about" className="link link-primary">
          사이트 소개
        </Link>
        를 참고하세요.
      </p>
    </div>
  );
}
