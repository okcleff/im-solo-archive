#!/usr/bin/env python3
"""403/429 재시도 — Safari UA + 도메인별 지연"""
import subprocess
import time
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlparse

HERE = Path(__file__).parent
IN_FILE = HERE / 'results.tsv'
OUT_FILE = HERE / 'results-final.tsv'
UA_SAFARI = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'

HEADERS = [
    '-A', UA_SAFARI,
    '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    '-H', 'Accept-Language: ko-KR,ko;q=0.9,en;q=0.8',
    '-H', 'Cache-Control: no-cache',
]

def check(url):
    try:
        r = subprocess.run(
            ['curl', '-o', '/dev/null', '-w', '%{http_code}\t%{url_effective}',
             '-sL', '--max-time', '25'] + HEADERS + [url],
            capture_output=True, text=True, timeout=35
        )
        out = r.stdout.strip()
        if '\t' in out:
            return tuple(out.split('\t', 1))
        return (out, url)
    except subprocess.TimeoutExpired:
        return ('TIMEOUT', url)
    except Exception as e:
        return (f'ERR:{type(e).__name__}', url)

rows = [line.split('\t') for line in IN_FILE.read_text().strip().split('\n')]
results = []

# 이전에 200인 건 그대로, 비200은 재시도 (도메인당 2초 간격)
domain_last_call = defaultdict(float)
recheck_count = 0
for code, final, sno, gender, handle, url in rows:
    if code == '200':
        results.append((code, final, sno, gender, handle, url))
        continue
    # 재시도
    dom = urlparse(url).netloc
    elapsed = time.time() - domain_last_call[dom]
    if elapsed < 2.5:
        time.sleep(2.5 - elapsed)
    new_code, new_final = check(url)
    domain_last_call[dom] = time.time()
    recheck_count += 1
    print(f'  rechecked: {code} -> {new_code}  ({dom})')
    results.append((new_code, new_final, sno, gender, handle, url))

OUT_FILE.write_text('\n'.join('\t'.join(r) for r in results) + '\n')

from collections import Counter
cnt = Counter(r[0] for r in results)
print(f'\nRechecked: {recheck_count}')
print(f'Final summary:')
for c, n in cnt.most_common():
    print(f'  {c}: {n}')
