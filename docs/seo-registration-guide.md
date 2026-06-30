# 검색엔진 등록 가이드 (네이버 · 구글)

코드 최적화만으로는 부족하고, 검색엔진에 사이트를 **직접 등록**해야 노출이 시작됩니다.
아래 순서대로 1회만 진행하면 됩니다.

> **진행 현황**
> - ✅ **구글 서치콘솔 소유권 확인 완료** — `public/google3ada63211b95f42e.html` 파일 업로드 방식. 남은 건 sitemap 제출(2번 참고).
> - ⬜ **네이버 서치어드바이저** — 아래 1번 절차 진행 필요.
>
> 네이버 인증 태그 자리는 코드에 이미 만들어 두었습니다. 발급받은 값을 `.env.local`(로컬)와
> Vercel 환경변수(배포)에 넣고 재배포하면 `<head>`에 자동으로 삽입됩니다.
>
> | 환경변수 | 검색엔진 |
> |---|---|
> | `NAVER_SITE_VERIFICATION` | 네이버 서치어드바이저 |

---

## 1. 네이버 서치어드바이저 (한국어 검색 핵심)

1. https://searchadvisor.naver.com 접속 → 네이버 로그인
2. **웹마스터 도구 → 사이트 등록**: `https://im-solo-archive.vercel.app` 입력
3. **사이트 소유확인** 단계에서 **"HTML 태그"** 방식 선택
   - 표시되는 `<meta name="naver-site-verification" content="여기값" />` 에서 `content` 값만 복사
4. 복사한 값을 환경변수에 등록
   - 로컬: `.env.local` 에 `NAVER_SITE_VERIFICATION=여기값`
   - 배포: Vercel → Project → Settings → Environment Variables 에 동일하게 추가
5. **재배포** (Vercel은 환경변수 추가 후 redeploy 필요)
6. 서치어드바이저로 돌아와 **소유확인** 클릭
7. 확인 후 **요청 → 사이트맵 제출**: `https://im-solo-archive.vercel.app/sitemap.xml`
8. **요청 → robots.txt 수집** 으로 robots도 인식시킴
9. (선택) **요청 → 웹페이지 수집**: 홈 URL 직접 제출해 색인 가속

> 네이버는 색인까지 며칠~2주가량 걸릴 수 있습니다. `검색 노출/현황`에서 진행 확인.

---

## 2. 구글 서치콘솔

> 소유권 확인은 `public/google3ada63211b95f42e.html` 파일 업로드로 **이미 완료**됨.
> (이 파일은 절대 삭제·이동하지 말 것 — 삭제 시 소유권 확인이 풀립니다.)

남은 작업:

1. https://search.google.com/search-console 접속 → 해당 속성 선택
2. 좌측 **Sitemaps** → `sitemap.xml` 제출
3. **URL 검사** 도구에 홈 URL 입력 → **색인 생성 요청**

---

## 3. 등록 후 확인 체크리스트

- [ ] 배포본 `<head>`에 네이버 인증 meta 태그가 보이는지 (브라우저 소스 보기)
- [ ] `https://im-solo-archive.vercel.app/google3ada63211b95f42e.html` 정상 응답 (구글 소유권)
- [ ] `https://im-solo-archive.vercel.app/sitemap.xml` 정상 응답
- [ ] `https://im-solo-archive.vercel.app/robots.txt` 정상 응답
- [ ] 구글: `site:im-solo-archive.vercel.app` 검색으로 색인 여부 확인 (며칠 후)
- [ ] 네이버: 서치어드바이저 `검색 노출 → 노출 현황` 확인

## 4. 타깃 검색어

색인 후 아래 검색어로 노출을 모니터링하세요.

- 나는솔로 아카이브
- 나는 솔로 역대 출연자 / 나는솔로 역대 출연자
- 나는솔로 역대 기수
- 나는솔로 기수별 출연자
- 나는 SOLO 출연자
