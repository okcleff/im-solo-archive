# 나는솔로 아카이브 데이터 수집/검증 프로토콜

이 문서는 참가자 데이터를 신규 수집하거나 기존 데이터를 보강·재수집할 때 따라야 할 공식 프로토콜이다. `/fill-season` 커맨드와 Stage B~E 모든 수집 작업에 적용된다.

## 1. 출처 위계

| 등급 | 유형 | 예시 |
|------|------|------|
| S | 공식 | MBC·tv조선 보도자료, 공식 유튜브, 출연자 본인 SNS |
| A | 1차 언론 | 연합/뉴시스/OSEN/스포츠경향/XPORTS/스포츠조선 등 |
| B | 연예 매체 | blacknews, gukjenews, salgoonews, sisamagazine 등 |
| C | 위키 | namu.wiki |
| D | 블로그/커뮤니티 | dategom, pasolra, tistory, 네이버 블로그 등 |

**원칙**:
- S → D 순으로 시도, **찾은 만큼 기록**
- 가십·비하인드·최종선택·근황 등 세부 정보는 **D급 출처에서 더 풍부**할 수 있으므로 기꺼이 사용
- 1개 출처만 있는 필드는 가능한 한 같은 사실을 다루는 2번째 독립 출처로 교차검증
- 블로그 2개가 서로를 복제한 경우는 1개로 취급

## 2. URL 유효성 게이트 (필수)

모든 `sources[]`, `bioSources[]` URL은 저장 전 아래 체크를 통과해야 한다.

### 2.1 HTTP 응답 게이트
```bash
curl -o /dev/null -w '%{http_code}' -sL --max-time 25 \
  -A 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15' \
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' \
  -H 'Accept-Language: ko-KR,ko;q=0.9,en;q=0.8' \
  "$URL"
```
- **통과 조건**: `200`, `301`, `302` 중 하나
- **실패 시 조치**: 해당 URL 기록 금지

### 2.2 도메인별 Rate Limit 회피
- 동일 도메인 연속 요청 시 **최소 2.5초 간격**
- dategom, the-next-investment, kekewo 등은 특히 민감

### 2.3 컨텐츠 관련성 게이트
HTTP 200이어도 아래 케이스는 reject:
- 404 랜딩 페이지로 redirect된 경우 (`final_url`이 원래와 다른 404/에러 페이지)
- 본문에 해당 기수·참가자 언급이 없는 경우 (WebFetch로 확인)
- 카테고리/리스트 페이지 (개별 기사가 아님)

### 2.4 재사용 스크립트
- `docs/url-audit/check.py` — 일괄 체크 (병렬 20)
- `docs/url-audit/recheck.py` — 비200 재시도 (Safari UA + 지연)
- 단건 수동 체크: `docs/url-audit/check-one.sh` (Stage A에서 생성)

## 3. Evidence-First 원칙

각 필드는 **출처 본문의 원문 인용 스니펫**이 있어야 한다.

### 3.1 필드별 증거 요구사항
| 필드 | 증거 형태 |
|------|-----------|
| `profile.birthYear` | "N살" / "NNNN년생" 등 명시적 언급 |
| `profile.job` | 직업 문자열이 출처 본문에 직접 등장 |
| `profile.region` | 거주지/지역이 출처 본문에 명시 |
| `instagram` | 핸들 `@xxx` 또는 `instagram.com/xxx` 링크가 출처에 명시 (또는 본인 계정에서 직접 출연 증명) |
| `finalChoice` | 최종선택 결과가 출처에 명시 |
| `bio` | bio 본문의 각 사실이 bioSources 중 하나 이상에서 확인 가능 |

### 3.2 증거 없을 때
- **없으면 null**. 추정 금지
- 블로그 출처 1개에만 있는 수치 정보(생년)는 "단일 블로그 = 낮은 신뢰"로 표시하되 그대로 기록은 가능 (추후 교차검증)

### 3.3 증거 로그
기수별 재수집 시 `docs/evidence/season-{N}.md`에 참가자별 인용을 기록:
```markdown
## F 영숙
- birthYear: 1992
  - > "삼성전자 UX 디자이너 (1992년생)" — blacknews.co.kr
- job: 삼성전자 UX 디자이너
  - > "영숙(1992년생, 삼성전자 UX 디자이너)" — namu.wiki
- instagram: 6.24sm (확인됨)
  - > "영숙 인스타그램 @6.24sm" — dategom.com 원문
```

## 4. Instagram 검증 규칙

인스타그램 핸들은 가장 오염되기 쉬운 필드다. 다음 조건을 전부 만족할 때만 기록한다.

### 4.1 필수 조건
1. **핸들 출처 명시**: 출처 기사/블로그에서 `@xxx` 또는 `instagram.com/xxx` 형태로 직접 언급
2. **교차검증**: 독립적인 2개 이상 출처가 같은 핸들을 지목하거나, 1개 출처 + 본인 피드에서 출연 언급 확인
3. **계정 존재 여부**: `https://www.instagram.com/{handle}/`이 404가 아님 (Stage E에서 Playwright로 일괄 확인)

### 4.2 의심스러울 때 null 원칙
- 팬 계정 의혹 (최근 활동 없음, 게시물이 방송 클립뿐)
- 동명이인 가능성 (한국에서 흔한 닉네임)
- 핸들이 출연자와 명확한 연결 고리가 없음
- → **null로 기록하고 evidence에 "확인불가" 사유 남김**

### 4.3 `@` 기호
- 스키마는 `@` 제외 username만 허용 (예: `6.24sm`, `lucky_amy00`)
- 저장 시 `@` 없이

## 5. 스테이징 워크플로

기수 단위 재수집은 다음 순서로 진행한다. **`git diff`가 곧 스테이징**이다 — 별도 스테이징 디렉터리는 두지 않는다.

```
1. evidence 로그 작성        docs/evidence/season-{N}.md
2. WebSearch/WebFetch 수집   + URL 게이트 통과한 URL만 기록
3. season-{N}.json 수정      src/entities/participant/lib/seasons/ 에 직접 적용
4. git diff 리뷰             사용자와 함께 변경점 검토
5. 빌드 검증                 npm run build (Zod 검증 포함)
6. 커밋                      한 기수 단위로 커밋
```

- Evidence 로그는 **필수** — 이후 감사·재검증 시 근거가 됨
- 커밋 단위는 기수별 → 문제 시 revert 용이

## 6. 체크리스트 (기수별 완료 기준)

- [ ] `docs/evidence/season-{N}.md` 작성 완료
- [ ] 모든 `sources[]`, `bioSources[]` URL이 HTTP 게이트 통과
- [ ] 각 참가자 필드에 최소 1개 증거 인용 존재
- [ ] Instagram 핸들은 2개 독립 출처 교차검증 통과 (아니면 null)
- [ ] `npm run build` 통과
- [ ] git diff 사용자 검토 완료

## 7. 적용 대상

- Stage B (20기 파일럿)
- Stage C (🔴 10기수 재수집)
- Stage D (🟡 7기수 참가자 보강)
- Stage E (Instagram 전수 검증)
- 향후 `/fill-season` 신규 기수 추가
