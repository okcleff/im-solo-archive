# 유사 검색어 SEO 강화 설계

## 목표

`나는솔로 아카이브` 외에 아래 유사 검색어로도 검색엔진(구글·네이버)에 노출되도록 한다.

- 나는 솔로 역대 출연자
- 나는솔로 역대 기수
- 나는솔로 기수별 출연자
- 나는 SOLO 출연자 (※ "출연진"이 아닌 "출연자"로 통일)

표기 변형 커버: `나는솔로` / `나는 솔로` / `나는 SOLO`

## 결정 사항

- 타깃 검색엔진: **구글 + 네이버** (네이버 비중 높게)
- 범위: 코드 최적화 + 검색엔진 등록 가이드 문서
- 워딩: 보이는 본문은 **"출연자"** 통일. `keywords`/JSON-LD에 "출연진"은 보조로만 포함
- 홈 콘텐츠: 키워드 h1 + 소개 문단 + 하단 FAQ 섹션 **적극 추가**

## 변경 범위

### 1. 홈 `src/app/page.tsx`
- `<h1>`: 작은 장식 라벨("출연진 아카이브") → `나는 SOLO 역대 기수별 출연자 아카이브`
- 소개 문단 1~2줄 (키워드 자연 삽입)
- 하단 FAQ 섹션 (3~4문항) + `FAQPage` JSON-LD
- `WebSite` JSON-LD (alternateName 표기 변형 + SearchAction)
- metadata title/description에 "역대·기수별·출연자" 반영

### 2. 전역 메타 `src/app/layout.tsx`, `src/shared/config/site.ts`
- `keywords` 배열 확장 (역대 출연자, 역대 기수, 기수별 출연자, 나는 솔로, 출연진(보조))
- 기본 title/description "출연진" → "출연자", "역대" 추가
- `metadata.verification`: 구글 + 네이버 인증 태그 자리 (env 변수 주입)
  - `GOOGLE_SITE_VERIFICATION`, `NAVER_SITE_VERIFICATION`

### 3. 검색엔진 등록 가이드 `docs/seo-registration-guide.md`
- 네이버 서치어드바이저 + 구글 서치콘솔 단계별 등록 절차
- 인증 태그 발급 → `.env` 입력 → 재배포 → sitemap 제출

## 검증

- `npm run build` 성공 (정적 페이지 생성 + Zod 검증)
- 빌드 산출 HTML에 키워드 h1/본문/FAQ 텍스트가 정적으로 포함되는지 확인

## 비목표 (YAGNI)

- 백링크/외부 홍보
- 출연자 상세 페이지 대규모 개편 (현 메타로 충분)
- 다음(Daum) 등록 (이번 범위 제외)
