import type { Metadata } from "next";
import { getSiteUrl } from "@/shared/config/site";

const BASE = getSiteUrl();
const CONTACT_EMAIL = "imsoloarchive@gmail.com";
const EFFECTIVE_DATE = "2026년 7월 1일";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "나는 SOLO 아카이브 개인정보처리방침 — 수집 항목, 이용 목적, 쿠키 및 웹 분석, 정보주체의 권리 안내.",
  alternates: { canonical: `${BASE}/privacy` },
  robots: { index: true, follow: true },
};

function Section({
  no,
  title,
  children,
}: {
  no: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-base-content">
        {no}. {title}
      </h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-base-content/75">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-(--font-title) tracking-tight">
        개인정보처리방침
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-base-content/70">
        &lsquo;나는 SOLO 아카이브&rsquo;(이하 &lsquo;사이트&rsquo;)는 이용자의
        개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련 법령을
        준수합니다.
      </p>

      <Section no={1} title="수집하는 개인정보 항목 및 방법">
        <p>
          사이트는 회원가입·로그인 기능이 없으며, 이용자로부터 개인정보를 직접
          입력받지 않습니다. 다만 서비스 이용 과정에서 아래 정보가 자동으로
          생성·수집될 수 있습니다.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            자동 수집: 쿠키, 접속 IP, 브라우저·기기 정보, 방문 일시, 서비스 이용
            기록 (웹 분석 도구를 통해 수집)
          </li>
          <li>
            문의 시: 이용자가 이메일로 문의·제보할 경우 이메일 주소 및 문의 내용
          </li>
        </ul>
      </Section>

      <Section no={2} title="개인정보의 수집·이용 목적">
        <ul className="list-disc pl-5 space-y-1">
          <li>웹사이트 이용 통계 분석 및 서비스 개선</li>
          <li>이용자 문의·제보에 대한 응대</li>
        </ul>
      </Section>

      <Section no={3} title="개인정보의 보유 및 이용 기간">
        <ul className="list-disc pl-5 space-y-1">
          <li>자동 수집 정보: 웹 분석 도구의 보관 정책에 따름</li>
          <li>
            문의 관련 정보: 문의 처리 완료 후 지체 없이 파기 (관련 법령상 보관이
            필요한 경우 해당 기간 동안 보관)
          </li>
        </ul>
      </Section>

      <Section no={4} title="개인정보 처리의 위탁 및 제3자 제공">
        <p>
          사이트는 이용자의 개인정보를 제3자에게 판매하거나 제공하지 않습니다.
          다만 원활한 서비스 운영을 위해 아래 업무를 위탁하고 있습니다.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            수탁자: Google LLC — Google Analytics / Google Tag Manager (웹사이트
            이용 통계 분석)
          </li>
          <li>
            향후 광고를 게재하는 경우, Google AdSense 등을 통한 광고 제공 및 관련
            쿠키 이용이 추가될 수 있으며, 변경 시 본 방침을 통해 고지합니다.
          </li>
        </ul>
      </Section>

      <Section no={5} title="쿠키의 사용 및 거부">
        <p>
          사이트는 이용 통계 분석을 위해 쿠키를 사용합니다. 이용자는 브라우저
          설정에서 쿠키 저장을 거부할 수 있으며, 이 경우 일부 기능 이용에 제한이
          있을 수 있습니다.
        </p>
        <p>
          Google Analytics 수집 거부:{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-primary break-all"
          >
            https://tools.google.com/dlpage/gaoptout
          </a>
        </p>
      </Section>

      <Section no={6} title="정보주체의 권리">
        <p>
          이용자는 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를
          요청할 수 있으며, 아래 연락처로 요청 시 지체 없이 조치합니다.
        </p>
      </Section>

      <Section no={7} title="게시된 출연자 정보에 관한 안내">
        <p>
          본 사이트는 공개된 언론 보도 등을 기반으로 한 비공식·비영리 팬
          아카이브이며, 방송 출연자의 초상(사진)은 게재하지 않습니다. 게시된
          정보의 정정·삭제를 원하는 당사자 또는 관계자는 아래 연락처로 요청하실
          수 있으며, 확인 후 신속히 처리합니다.
        </p>
      </Section>

      <Section no={8} title="개인정보 보호책임자 및 문의">
        <ul className="list-disc pl-5 space-y-1">
          <li>운영: 나는 SOLO 아카이브 운영자</li>
          <li>
            연락처:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="link link-primary"
            >
              {CONTACT_EMAIL}
            </a>
          </li>
        </ul>
      </Section>

      <Section no={9} title="고지의 의무">
        <p>
          본 개인정보처리방침의 내용에 추가·삭제·수정이 있을 경우 사이트를 통해
          사전 고지합니다.
        </p>
      </Section>

      <p className="mt-10 text-xs text-base-content/55">
        시행일: {EFFECTIVE_DATE}
      </p>
    </div>
  );
}
