#!/usr/bin/env bash
# 단건 URL 유효성 게이트 — Stage B 이후 신규 수집에서 사용
# 사용법: ./check-one.sh "URL"
# 종료코드: 0 = 통과 (200/301/302), 1 = 실패

set -euo pipefail

URL="${1:?URL required}"
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'

RESULT=$(curl -o /dev/null -w '%{http_code}\t%{url_effective}' -sL --max-time 25 \
    -A "$UA" \
    -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' \
    -H 'Accept-Language: ko-KR,ko;q=0.9,en;q=0.8' \
    "$URL" 2>&1 || echo "ERR")

CODE="${RESULT%%	*}"
FINAL="${RESULT#*	}"

echo "code=$CODE"
echo "final=$FINAL"

case "$CODE" in
    200|301|302)
        echo "PASS"
        exit 0
        ;;
    *)
        echo "FAIL"
        exit 1
        ;;
esac
