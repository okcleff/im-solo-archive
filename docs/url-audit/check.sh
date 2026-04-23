#!/usr/bin/env bash
# URL 접근성 일괄 감사
# 입력: urls.tsv (seasonNo, gender, handle, url)
# 출력: results.tsv (status, seasonNo, gender, handle, url, final_url)

set -euo pipefail

IN="$(dirname "$0")/urls.tsv"
OUT="$(dirname "$0")/results.tsv"

UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

: > "$OUT"

total=$(wc -l < "$IN" | tr -d ' ')
i=0

# 병렬 처리로 속도 ↑ (20 동시)
check_one() {
    local line="$1"
    local sno gender handle url
    IFS=$'\t' read -r sno gender handle url <<< "$line"
    # -L: 리다이렉트 따라가기, -o /dev/null: 바디 버림, -w: 포맷, -s: silent, --max-time: 타임아웃
    local result
    result=$(curl -o /dev/null -w '%{http_code}\t%{url_effective}' -sL --max-time 20 -A "$UA" "$url" 2>/dev/null || echo "ERR\t$url")
    printf "%s\t%s\t%s\t%s\t%s\n" "$result" "$sno" "$gender" "$handle" "$url"
}

export -f check_one
export UA

# xargs -P로 병렬
cat "$IN" | xargs -I{} -P 20 bash -c 'check_one "$@"' _ {} >> "$OUT"

echo "Done. Results in $OUT"
echo "--- Status summary ---"
awk -F'\t' '{print $1}' "$OUT" | sort | uniq -c | sort -rn
