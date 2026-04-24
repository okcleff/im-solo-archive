#!/usr/bin/env python3
"""Instagram 핸들 title tag 일괄 검증"""
import subprocess, time
from pathlib import Path
import re, html

UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'

rows = []
for line in Path('/tmp/stage-e-handles.tsv').read_text().strip().split('\n'):
    parts = line.split('\t')
    if len(parts) == 4:
        rows.append(parts)

results = []
for sno, gender, handle, ig in rows:
    try:
        r = subprocess.run(
            ['curl', '-sL', '--max-time', '15', '-A', UA, f'https://www.instagram.com/{ig}/'],
            capture_output=True, text=True, timeout=20
        )
        m = re.search(r'<title>([^<]+)</title>', r.stdout)
        title = html.unescape(m.group(1)) if m else '(no title)'
        # username 제거
        display = re.sub(r'\s*\(@[^)]+\)\s*•\s*Instagram.*', '', title).strip()
        if not display or display == 'Instagram':
            display = '(empty)'
        results.append((sno, gender, handle, ig, display))
        print(f'기수{sno} {gender} {handle} @{ig} → {display}', flush=True)
    except Exception as e:
        results.append((sno, gender, handle, ig, f'ERROR: {e}'))
    time.sleep(1)

Path('/tmp/stage-e-results.tsv').write_text(
    '\n'.join('\t'.join(map(str, r)) for r in results) + '\n'
)
print(f'\n완료: {len(results)}개')
