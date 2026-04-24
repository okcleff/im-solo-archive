# 데이터 품질 감사 최종 보고서

**기간**: 2026-04-23 ~ 2026-04-24
**브랜치**: `feature/participant-data`
**커밋 수**: 15 (Stage 0 → Stage F)

## 최종 결과

| 지표 | 시작 | 종료 | 변화 |
|------|------|------|------|
| 참가자 | 367 | 367 | — |
| 전체 sources URL | 516 | **1,073** | **+557** |
| 신뢰 출처 보유 참가자 | 270 | **367** | **+97** (100% 달성) |
| Instagram 핸들 | 168 | **171** | +3 (광수 22기 제외·28기 영철 추가 등) |
| 실제 Dead Link | 2 | **0** | -2 (기수 6 수정) |

## 주요 발견

### 1. pasolra 블로그의 Instagram 핸들 오염
- 20기 여성 핸들이 전부 오염 → 사용자의 최초 지적 확인
- 원인 추적: pasolra가 18기 핸들 리스트를 복사해 20기로 잘못 옮김
- 20기 12개 핸들 전면 교체 (Naver 블로그 jangkkoo + dategom 2출처 교차검증)
- 25기 상철에도 pasolra 유산(`sapsaree_kang`) 잔존 → 제거

### 2. 증거 기반 검증의 힘
Playwright/curl로 Instagram 프로필의 `<title>` 태그에서 display name을 추출하여 다음 신호 발견:
- **본인 선언**: "20기 광수", "21기 옥순", "22영숙", "22기 현숙", "28기 영식" 등 12건
- **실명 노출**: 이호영, 김용식, 이정훈, 박호진, 문준엽, 김지언 등 40+건
- **직업 매칭**: "패션회사 윤대리" (LF MD), "anesthesiologist" (마취과의사), "일러스트레이터 여우지니" (일러스트레이터) 등

### 3. URL 유효성 게이트의 필요
Safari UA + 도메인별 지연 없이는 dategom·the-next-investment 등 30+ 도메인이 봇 차단으로 오류 보고. 표준 게이트 스크립트 확립.

## Stage별 요약

### Stage 0 — URL 접근성 감사
516개 URL 전수 검사. 봇차단 60건 오검출 제거 후 실제 dead link 2개 확정 (기수 6 영수/영숙). 모두 수정 완료.

### Stage A — 프로토콜 확립
`docs/data-quality-protocol.md` 작성. 출처 위계(S/A/B/C/D), URL 게이트, Evidence-first, Instagram 2-source rule 명문화. bioSources 추가 감사 (499개 → dead 0건).

### Stage B — 20기 파일럿 재수집
pasolra 오염을 확정하고 Naver 블로그(jangkkoo) + dategom + Playwright로 2출처 체계 구축. 12개 Instagram 핸들 전면 교체. `jeong.jy0321` display "20기 광수" 본인 확정이 결정적 증거.

### Stage C — 🔴 10기수 순차 재수집
15, 18, 21, 22, 23, 24, 25, 27, 28, 29 순차 처리. 20기와 달리 대부분 기존 데이터 정확 (블로그-only 출처 문제는 있었으나 인스타 매핑은 정확). 뉴스 출처(dailycc/topstarnews/wikitree/nbntv 등) 광역 추가.

### Stage D — 🟡 7기수 참가자 단위 보강
신뢰 출처 0건 40명에게 blacknews 역대 총정리 URL 일괄 추가. 367명 전원 신뢰 출처 보유 달성.

### Stage E — 전 기수 Instagram 전수 검증
Stage B/C 미검증 46개 핸들 curl 검증. 본인 선언 6건, 실명 20+건 추가 확인. 의심 3건 플래그:
- 7기 영수↔영식 display "김용수" 중복
- 7기 영철 @kkh3102 아랍어 display
- 9기 옥순 @joy15th (15기 연관 추정)

### Stage F — 최종 감사
`npm run build` 402 페이지 전부 빌드 성공. Zod 스키마 검증 통과.

## 산출물

### 데이터 변경
- `src/entities/participant/lib/seasons/season-*.json` — 11개 기수 업데이트 (15, 18, 20, 21, 22, 23, 24, 25, 27, 28, 29) + Stage D 7개 기수 (10, 12, 13, 14, 19, 26, 30) + 기수 6 dead link 정리

### 인프라
- `docs/data-quality-protocol.md` — 수집/검증 프로토콜 문서
- `docs/url-audit/` — URL 게이트 스크립트 (check.py, check-one.sh, recheck.py, check-biosources.py, check-ig-handles.py)
- `docs/url-audit/REPORT.md` — URL 감사 보고서

### 증거 로그
- `docs/evidence/season-15.md` ~ `season-29.md` — Stage C 기수별 evidence
- `docs/evidence/season-20.md` — Stage B 파일럿 상세 기록
- `docs/evidence/stage-d.md` — Stage D 요약
- `docs/evidence/stage-e.md` — Instagram 전수 검증 요약
- `docs/evidence/FINAL-REPORT.md` — 본 문서

## 남은 과제 (후속 작업)

1. **7기 영수/영식 중복 "김용수"** 핸들 조사 (현재: 유지, 플래그)
2. **9기 옥순 @joy15th** 15기 연관성 조사 (15기와 핸들 공유 여부, 실제 본인 판별)
3. **7기 영철 @kkh3102** 아랍어 display 의미 조사
4. **24기 현숙 birthYear** null → dailycc 기반 1990 보정 (Stage D 때 놓침)
5. **25기 영철·순자·현숙·미경** 핸들 null 상태 — woojw 블로그 후보 있음, 검증 가능 시 채움
6. **22기 순자 지역** 전주 ↔ 완주 재확인 (dailycc는 완주, 현재 전주)

## 결론

사용자 지적 "20기 여성 인스타 부정확"을 시작으로 전체 데이터셋의 신뢰도 감사를 수행했다. 가장 큰 성과는 pasolra 블로그의 체계적 오염 발견 및 2-source + Playwright 검증 체계 확립이다. 367명 전원 신뢰 출처 보유, 171개 인스타 핸들 전수 존재 확인, Zod 빌드 통과. 
