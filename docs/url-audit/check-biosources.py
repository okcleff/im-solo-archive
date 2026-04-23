#!/usr/bin/env python3
"""bioSources URL 감사 — Safari UA + 도메인별 지연 내장"""
import subprocess
import time
from collections import defaultdict, Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urlparse

HERE = Path(__file__).parent
IN_FILE = HERE / 'biosources-urls.tsv'
OUT_FILE = HERE / 'biosources-results.tsv'
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'

def check(url):
    try:
        r = subprocess.run(
            ['curl', '-o', '/dev/null', '-w', '%{http_code}\t%{url_effective}',
             '-sL', '--max-time', '25',
             '-A', UA,
             '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
             '-H', 'Accept-Language: ko-KR,ko;q=0.9,en;q=0.8',
             url],
            capture_output=True, text=True, timeout=35
        )
        out = r.stdout.strip()
        if '\t' in out:
            code, final = out.split('\t', 1)
            return code, final
        return out, url
    except subprocess.TimeoutExpired:
        return 'TIMEOUT', url
    except Exception as e:
        return f'ERR:{type(e).__name__}', url

def main():
    rows = [line.split('\t') for line in IN_FILE.read_text().strip().split('\n') if line.strip()]
    # 도메인별 그룹화 → 같은 도메인은 직렬 (rate limit 회피), 다른 도메인 간 병렬
    by_domain = defaultdict(list)
    for row in rows:
        by_domain[urlparse(row[3]).netloc].append(row)

    print(f'{len(rows)} URLs across {len(by_domain)} domains', flush=True)

    def worker(domain_rows):
        out = []
        for row in domain_rows:
            sno, gender, handle, url = row
            code, final = check(url)
            out.append((code, final, sno, gender, handle, url))
            time.sleep(1.5)  # 같은 도메인 내 간격
        return out

    results = []
    with ThreadPoolExecutor(max_workers=20) as ex:
        futures = {ex.submit(worker, v): k for k, v in by_domain.items()}
        done = 0
        for fut in as_completed(futures):
            results.extend(fut.result())
            done += 1
            if done % 10 == 0:
                print(f'  {done}/{len(by_domain)} domains done', flush=True)

    OUT_FILE.write_text('\n'.join('\t'.join(r) for r in results) + '\n')
    cnt = Counter(r[0] for r in results)
    print('\n--- Status summary ---')
    for c, n in cnt.most_common():
        print(f'  {c}: {n}')
    print(f'\nWrote {len(results)} rows to {OUT_FILE}')

if __name__ == '__main__':
    main()
