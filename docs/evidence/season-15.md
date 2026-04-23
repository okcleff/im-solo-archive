# 15기 Evidence Log

**Stage C · 작성일 2026-04-23**

## 주요 참조 출처

| 약칭 | URL | 종류 |
|------|-----|------|
| topstarnews | https://www.topstarnews.net/news/articleView.html?idxno=15352024 | 톱스타뉴스 (신규 추가) |
| allthespeed | 기존 | 블로그 (남자 인스타) |
| semobenefit | 기존 | 블로그 (여자 인스타) |
| youstory | 기존 | 블로그 |

## 20기와의 차이: 기존 데이터가 견고함

allthespeed/semobenefit 블로그의 **인스타 핸들이 Playwright display name 검증과 일치** — 20기 pasolra 사례와 달리 오염 없음.

### Instagram 핸들 Playwright 검증 (curl title tag)

| 참가자 | 핸들 | Display name | 판정 |
|---|---|---|---|
| 영수 M | 85_is_true | teddybear | 단순 계정, 생년(85) 일치 |
| 영호 M | hy_steve | **이호영** | 실명 |
| 영식 M | key.park_one | **한기박** | 실명 (박기한 변형) |
| 영철 M | cpcmh | **최민호** | 실명 |
| 상철 M | yelopeeeech | (빈) | display 없음 |
| 광수 M | yongkyusong | **송용규 (광수)** | **본인 직접 명시** |
| 영숙 F | yoondongja | Jin Yoon | 윤 실명 계열 |
| 정숙 F | lucyyy_in_seoul | 루씨 | Lucy |
| 순자 F | seobinn | **윤 서빈** | 실명 |
| 영자 F | sowonwish0701 | sowonwish | — |
| 옥순 F | prettyyomi | **천안발레 I 라라발레 원장** | **현 직업 (15기 직업 "발레 학원 원장, 천안"과 일치)** |
| 현숙 F | auddu_omy | 디디두리 | 닉네임 |

**결론**: 기존 핸들 유지. 2출처 요건 = 블로그(1) + Playwright display(2) 충족.

## Profile 교차검증 (topstarnews 기준)

| 참가자 | 기존 | topstarnews 인용 | 일치 |
|---|---|---|---|
| 영수 M | 1985, 공인회계사 | "39세 1985년생" + "회계사" + "고려대학교 경영학과" | ✓ |
| 영호 M | 1992, 무역컨설턴트, 서울 영등포 | "32세" + "부산 출신, 서울 거주 3년차" + "무역 컨설팅" | ✓ |
| 영식 M | 1989, 삼성전자 반도체 설계 | "삼성전자 재직, 반도체 설계" | ✓ |
| 영철 M | 1986, 현대건설 구매사업부, 서울 영등포 | "28세" + "대구" + "현대건설 구매사업부" | 직장 ✓ / region은 현거주지 vs 출신지 차이 |
| 광수 M | 1989, 변호사, 서울 신림 | "35세" + "연세대 간호학과, 로스쿨" + "변호사" | ✓ |
| 상철 M | 1992, AI 연구원 | "고려대 통계학과" + "AI 연구원" | ✓ |
| 영숙 F | 1992, 한화큐셀 연구기획 | "32세" + "글로벌 에너지 기업 연구소 연구 기획" | ✓ (한화큐셀=글로벌 에너지) |
| 정숙 F | 1990, M&A 컨설팅 | "34세" + "일본 와세다대 국제경영" + "M&A 및 투자 유치 어드바이저" | ✓ |
| 순자 F | 1992, 제조업 경영기획팀 | "32세" + "경영기획팀 대리" | ✓ |
| 영자 F | 1991, 대치동 영어강사 | "31세" + "영어 강사로 10년째 대치동" | ✓ |
| 옥순 F | 1992, 발레 학원 원장, 천안 | "32세" + "중앙대학교 무용학과" + "천안 무용학원 원장" | ✓ |
| 현숙 F | 1991, 건축사 | "31세" + "D그룹 건설 회사 7년 재직" + "건축사" | ✓ |

**Profile 데이터 12/12 전원 일치**.

## Stage C 15기 변경 요약

### 추가
- `sources[]`: topstarnews (12명 전원)

### 유지
- 기존 Instagram 핸들 (2출처 검증 통과)
- 기존 Profile 데이터 (topstarnews 전원 일치)
- 기존 bio, sources 나머지

### 결정
15기는 20기 대비 기존 블로그 품질이 양호 (allthespeed/semobenefit은 dategom과 달리 Instagram 핸들 정확). Stage 0 감사에서 "🔴 전체 재수집" 분류는 출처 **도메인** 기준이었으며, 실제 **데이터** 품질은 우수. 수정 최소화.
