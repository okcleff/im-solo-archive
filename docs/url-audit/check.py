#!/usr/bin/env python3
"""URL 접근성 일괄 감사 (병렬)"""
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

HERE = Path(__file__).parent
IN_FILE = HERE / 'urls.tsv'
OUT_FILE = HERE / 'results.tsv'
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

def check(row):
    sno, gender, handle, url = row
    try:
        r = subprocess.run(
            ['curl', '-o', '/dev/null', '-w', '%{http_code}\t%{url_effective}',
             '-sL', '--max-time', '20', '-A', UA, url],
            capture_output=True, text=True, timeout=30
        )
        out = r.stdout.strip()
        if '\t' in out:
            code, final = out.split('\t', 1)
        else:
            code, final = out, url
    except subprocess.TimeoutExpired:
        code, final = 'TIMEOUT', url
    except Exception as e:
        code, final = f'ERR:{type(e).__name__}', url
    return (code, final, sno, gender, handle, url)

def main():
    rows = []
    for line in IN_FILE.read_text().strip().split('\n'):
        parts = line.split('\t')
        if len(parts) == 4:
            rows.append(parts)

    total = len(rows)
    print(f'Checking {total} URLs with 20 parallel workers...', file=sys.stderr)

    results = []
    with ThreadPoolExecutor(max_workers=20) as ex:
        futures = {ex.submit(check, r): r for r in rows}
        done = 0
        for fut in as_completed(futures):
            results.append(fut.result())
            done += 1
            if done % 50 == 0:
                print(f'  {done}/{total}', file=sys.stderr)

    with OUT_FILE.open('w') as f:
        for r in results:
            f.write('\t'.join(r) + '\n')

    # 상태 집계
    from collections import Counter
    counts = Counter(r[0] for r in results)
    print('\n--- Status summary ---', file=sys.stderr)
    for code, cnt in counts.most_common():
        print(f'  {code}: {cnt}', file=sys.stderr)
    print(f'\nWrote {len(results)} rows to {OUT_FILE}', file=sys.stderr)

if __name__ == '__main__':
    main()
