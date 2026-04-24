# 20기 Evidence Log

**Stage B 파일럿 · 작성일 2026-04-23**

## 주요 참조 출처

| 약칭 | URL | 종류 |
|------|-----|------|
| dailycc A | https://www.dailycc.net/news/articleView.html?idxno=784093 | 충청신문 (1차 언론) |
| dailycc B | https://www.dailycc.net/news/articleView.html?idxno=786515 | 충청신문 (1차 언론) |
| topstarnews | https://www.topstarnews.net/news/articleView.html?idxno=15488054 | 톱스타뉴스 (연예 매체) |
| naver-jangkkoo | https://blog.naver.com/jangkkoo/223452660792 | 네이버 블로그, **인스타 핸들 1차 출처** |
| dategom | https://dategom.com/나는솔로-20기-엘리트-특집-.../ | 블로그, **인스타 핸들 2차 출처** (naver와 일치) |
| pasolra | https://today.pasolra.com/나는솔로-20기-인스타/ | 블로그, **인스타 핸들은 오염** (배제) |

## Instagram 핸들 재검증 (핵심 성과)

### 출처 충돌 패턴
- **dategom + naver-jangkkoo (2 출처)** 가 서로 완벽히 일치
- **pasolra (1 출처)** 는 전혀 다른 핸들 목록 제시
- 프로토콜 §4.1 "2+ 독립 출처 교차검증" 적용 → Naver+dategom 채택, pasolra 배제

### 결정적 증거
- `jeong.jy0321` (광수) Playwright display name = **"20기 광수"** — 본인 직접 명시
- `nogurchito` → "노주형", `mingquu` → "김민규", `ry.ool` → "Dong Ryool Choi", `bitterpeach.kr` → "이은율", `jyujin_smile` → "찐유진", `hyemnie` → "혬자" — 전부 실명/닉네임 포맷

### 최종 매핑

| 참가자 | 이전(pasolra·오염) | 현재(검증) | Playwright display | 교차확인 |
|---|---|---|---|---|
| 영수 M | eunkyulee86 | **nogurchito** | 노주형 | dategom+naver |
| 영호 M | kkobki (계정 소실) | **powermks** | powermks | dategom+naver |
| 영식 M | beooom_s | **mingquu** | 김민규 | dategom+naver |
| 영철 M | sapsaree_kang | **ry.ool** | Dong Ryool Choi | dategom+naver |
| 광수 M | null | **jeong.jy0321** | **"20기 광수"** | naver (본인 선언) |
| 상철 M | ninezero.kwon | **mezzzzzzzini** | (빈) | dategom+naver |
| 영숙 F | lucky_amy00 | **ddohyunnii** | (빈) | dategom+naver |
| 정숙 F | _gaeng_e | **bitterpeach.kr** | 이은율 | dategom+naver |
| 순자 F | ji__sn | **r_ang22** | (빈) | dategom+naver |
| 영자 F | hihjhihj3 | **hyemnie** | 혬자 | dategom+naver |
| 옥순 F | elizabeth0912i | **globetrotterheej** | (빈) | dategom+naver |
| 현숙 F | where_not_1 | **jyujin_smile** | 찐유진 | dategom+naver |

## Profile 데이터 교차검증

dailycc A/B와 기존 데이터 교차검증 결과 **12명 중 10명 일치**. 2명은 미세 표현 차이:

- **영자**: 기존 "롯데멤버스 디지털 마케팅" vs dailycc "금융 지원 서비스 재직" → 롯데멤버스는 롯데카드 계열 플랫폼으로 "금융 지원 서비스" 범주에 포함 가능 → **유지**
- **현숙**: 기존 "아모레퍼시픽 화장품 연구원" vs dailycc "S대 약대 학사/석사 약사, 화장품 회사 연구원" → 약사 자격 + 아모레퍼시픽 근무가 논리적으로 일관 → **유지**

### 참가자별 직업 증거 (dailycc 인용)
- 영수: "소아과 의사"
- 영호: "품질 경영팀 근무, 90년생"
- 영식: "은행원, 90년생"
- 영철: "글로벌 IT 회사에서 프로세스 엔지니어로 일하고 있다"
- 광수: "회로 설계 연구원→현재 방 탈출 설계자, 89년생"
- 상철: "AI 개발자, 88년생"
- 영숙: "제철 회사 근무, 91년생"
- 정숙: "공대를 졸업해서 전자 본사에서 과장급 선임으로 재직중이다"
- 순자: "초등학교 교사, 92년생" + "서울 강동구에 집을 샀다"
- 영자: "금융 지원 서비스 재직, 94년생, Y대 경영학과 출신"
- 옥순: "7기 옥순의 친동생" + "글로벌 초대형 IT 기업 G사 소프트 엔지니어, 미국 아이비리그 출신"
- 현숙: "S대 약대에서 학사, 석사를 딴 찐 엘리트"

## JSON 변경 요약

### sources[] 추가 (12명 전원)
- `dailycc A` (idxno=784093)
- `dailycc B` (idxno=786515)
- `topstarnews` (idxno=15488054)
- `naver-jangkkoo` (223452660792)

### 유지
- 기존 `dategom`, `pasolra` URL — 프로필 정보 출처로서 여전히 유효
- 기존 `etoday`, `newscj`, `nbntv` bioSources — bio 근거

### Instagram 전수 교체
pasolra 12개 → naver+dategom 12개 (전원 Playwright 존재 확인)

## 교훈 (Stage C에 반영)

1. **Instagram은 최소 2 독립 출처 필요** — 1 출처 시 오염 리스크 크다는 게 실증됨
2. **Playwright display name이 강력한 검증 신호** — 실명/본인 언급(20기 광수) 나오면 확정
3. **기존 데이터는 pasolra를 1차 소스로 썼던 듯** — 다른 기수(15, 18, 21~25, 27~29)도 동일 오염 가능성 크다 → Stage C 최우선 체크
4. **dategom의 인스타 섹션과 프로필 섹션을 분리 평가**: 프로필은 정확, 인스타는 정확(naver와 일치). 초기 Stage 0 감사에서 dategom 전체를 저품질로 본 건 과도한 일반화였음
