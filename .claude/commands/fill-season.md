나는 SOLO **$ARGUMENTS**기 출연자 데이터를 수집해서 `src/entities/participant/lib/seasons/season-$ARGUMENTS.json` 파일을 생성해줘.

## 수집 순서

### 1단계: 기수 기본 정보 파악

- `나는솔로 $ARGUMENTS기 출연자` 또는 `나는SOLO $ARGUMENTS기` 로 웹 검색
- 수집 항목:
  - `label`: 기수 부제 (예: "30기 (에겐남 & 테토녀)")
  - `episodes`: 방영 회차 번호와 날짜 목록 (`ep`, `airDate: YYYY-MM-DD`)
  - 출연자 전체 목록 (이름 + 성별)

### 2단계: 출연자별 개인정보 수집

각 출연자에 대해 검색 후 아래 필드를 채운다:

- `birthYear`: 출생연도 (숫자, 없으면 null)
- `job`: 직업/직책 (없으면 null)
- `region`: 거주 지역 (없으면 null)
- `instagram`: 인스타그램 username, @ 제외 (없으면 null)
- `finalChoice`: 최종 선택 상대방 handle (없으면 null)
- `sources`: 참조한 기사/블로그 URL 목록 (string 배열)

**원칙:**

- 출처 없이 필드를 채우지 않는다 — 찾지 못하면 반드시 `null`
- `photo.src`는 항상 `null`로 설정
- `photo.alt`는 `"나는 SOLO $ARGUMENTS기 {handle}"` 형식

### 3단계: 출연자별 방송 하이라이트(bio) 수집

각 출연자에 대해 검색 후 `bio` 필드를 채운다.

**검색 쿼리 (순서대로 시도):**
- `나는솔로 $ARGUMENTS기 {handle} 이슈`
- `나는솔로 $ARGUMENTS기 {handle} 명언`
- `나는솔로 $ARGUMENTS기 {handle} 하이라이트`
- `나는SOLO $ARGUMENTS기 {handle} 화제`

**수집 기준:**
- 방송 중 실제 발생한 화제 행동·멘트·에피소드만 수록
- 출처(기사, 블로그 등)로 확인된 내용만 — 추측성 내용 제외
- 사생활(방송 외 개인 정보) 내용 제외
- 2~4문장, 한국어 서술체로 작성
- 찾지 못하면 반드시 `null` (출처 없이 채우지 않는다)

### 4단계: JSON 파일 생성

아래 스키마를 정확히 준수해서 파일을 작성한다:

```json
{
  "seasonNo": $ARGUMENTS,
  "label": "기수 부제",
  "episodes": [
    { "ep": 회차번호, "airDate": "YYYY-MM-DD" }
  ],
  "participants": [
    {
      "seasonNo": $ARGUMENTS,
      "gender": "M 또는 F",
      "handle": "출연자 이름",
      "photo": { "src": null, "alt": "나는 SOLO $ARGUMENTS기 이름" },
      "instagram": null,
      "profile": {
        "birthYear": null,
        "job": null,
        "region": null
      },
      "sources": [],
      "bio": null,
      "finalChoice": null
    }
  ]
}
```

### 5단계: 빌드 검증

파일 저장 후 아래 명령어로 스키마 검증:

```bash
npm run build
```

빌드 실패 시 에러 메시지를 보고 JSON을 수정한다.

### 6단계: 완료 요약

수집 완료 후 아래 형식으로 요약 출력:

```
✅ season-$ARGUMENTS.json 생성 완료
출연자: N명 (남 N / 여 N)

⚠️ null 필드 목록 (직접 보완 필요):
- 영수: birthYear, region, bio
- 옥순: instagram, bio
...
```
