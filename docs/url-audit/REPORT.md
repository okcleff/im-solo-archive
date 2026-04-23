# URL 접근성 감사 보고서

- **감사 일자**: 2026-04-23
- **대상**: 전 기수 `sources[]` URL 총 **516개**
- **방법**: `curl -sL --max-time 20` + Safari UA + 언어 헤더, 비200 응답은 재시도

## 최종 결과

| HTTP 코드 | 건수 | 비율 | 처리 방침 |
|-----------|------|------|-----------|
| 200       | 514  | 99.6% | 유지 |
| 000 (DNS 실패) | 1 | 0.2% | 제거 또는 교체 |
| 404       | 1    | 0.2% | 제거 또는 교체 |

## 초기 오검출 (1차 curl)

1차 체크에서 403/429로 플래그된 60건은 **모두 봇 탐지에 의한 오검출**이었음:
- `dategom.com` 30건 → Chrome UA 차단, Safari UA로 재시도 시 전부 200
- `the-next-investment.com` 25건 → 빠른 연속 요청 시 429, 도메인별 2.5초 지연으로 전부 200
- `kekewo.net` 2건, `fromschannel.com` 3건 → 같은 원인

**교훈**: URL 유효성 게이트 구현 시 Safari UA + 도메인별 rate limit 회피가 필수.

## 실제 Dead Link (2건)

| 기수 | 참가자 | 코드 | URL |
|------|--------|------|-----|
| 6 | F 영숙 | 000 (DNS) | `issuesdaily.com/entertainer/나는솔로-6기-영숙/` |
| 6 | M 영철 | 404 | `blacknews.co.kr/나는솔로-역대-출연자-직업-나이-사진-프로필-총정리/` |

### 조치

- **기수 6**은 이 2건 외 12개 출처가 모두 살아있음 → 해당 참가자들에게 다른 출처가 있는지 확인 후:
  - 이미 다른 유효 출처가 있으면 dead link만 제거
  - 없으면 Stage D 보강 대상에 편입 (현재 기수 6은 🟢이므로 재확인 필요)

## 우선순위 영향

Stage 0 결과는 **Stage C 우선순위에 큰 영향 없음** — dead link 2개는 🟢 기수 6에 있고, 🔴/🟡 기수들의 URL은 전부 살아있음. 따라서 기존 계획대로 Stage A → B(20기) 순으로 진행.

## bioSources 추가 감사 (Stage A 보강)

초기 감사는 `sources[]` 516개만 대상이었고 `bioSources[]` 499개(중복 제거 후 신규 321개)는 누락. Stage A에서 추가 감사 시행.

| HTTP 코드 | 건수 | 비고 |
|-----------|------|------|
| 200       | 315  | OK |
| 302       | 4    | 정상 리다이렉트 (OK) |
| 429       | 2    | brunch.co.kr — WebFetch로 확인 시 공개 접근 가능 |

**bioSources에서 실제 dead link: 0건**.

## 인프라 산출물

재사용 가능한 URL 유효성 검증 스크립트:
- `docs/url-audit/check.py` — sources 일괄 체크 (병렬 20)
- `docs/url-audit/recheck.py` — 비200 재시도 (UA 교체 + 지연)
- `docs/url-audit/check-biosources.py` — bioSources 일괄 체크 (도메인별 지연 내장)
- `docs/url-audit/check-one.sh` — 단건 URL 게이트 (Stage B 이후 신규 수집용)

Stage B 이후 신규 수집하는 URL도 이 스크립트로 게이트 통과시킨다.
