#!/usr/bin/env node
/**
 * 나는 SOLO 기수별 출연자 데이터 크롤러
 *
 * 사용법:
 *   npm run crawl-season -- <기수번호>
 *   npm run crawl-season -- <기수번호> --inject   (data.ts 자동 삽입)
 *
 * 예시:
 *   npm run crawl-season -- 26
 *   npm run crawl-season -- 26 --inject
 *
 * 동작:
 *   1. namu.moe에서 기수 페이지 파싱 (출연자 이름/프로필)
 *   2. DuckDuckGo로 뉴스 기사 검색 후 파싱 (직업/나이/지역 보강)
 *   3. scripts/output/season-N-draft.ts 초안 파일 생성
 *   4. --inject 플래그 시 data.ts SEASONS_DATA 맨 앞에 자동 삽입
 *
 * ⚠️  자동 수집 데이터는 정확도 보장이 안 되므로 반드시 검토 후 사용하세요.
 */

import { load } from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';

// ─── Types ──────────────────────────────────────────────────────────────────

type Confidence = 'high' | 'medium' | 'low';
type Gender = 'M' | 'F';

interface Source {
  title: string;
  url: string;
  confidence: Confidence;
}

interface RawParticipant {
  handle: string;
  gender: Gender;
  birthYear: number | null;
  job: string | null;
  region: string | null;
  traits: string[];
  notableQuotes: string[];
  issues: string[];
  sources: Source[];
}

interface RawSeason {
  seasonNo: number;
  label: string;
  episodes: Array<{ ep: number; airDate: string }>;
  participants: RawParticipant[];
}

// ─── HTTP ────────────────────────────────────────────────────────────────────

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function fetchHtml(url: string, timeoutMs = 12_000): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

// ─── Naver Blog & Tistory ────────────────────────────────────────────────────

/**
 * Naver 블로그 검색: 기수 관련 포스트 URL 수집.
 * 검색 결과 HTML에서 blog.naver.com / tistory.com 링크를 추출한다.
 */
async function searchNaverBlog(seasonNo: number): Promise<string[]> {
  const queries = [
    `나는 SOLO ${seasonNo}기 출연자 직업 나이 프로필`,
    `나는솔로 ${seasonNo}기 출연자 정리`,
  ];

  const links = new Set<string>();

  for (const query of queries) {
    const url = `https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(query)}&sm=tab_opt&nso=so%3Ar%2Cp%3Aall`;
    process.stdout.write(`  🔍 Naver 블로그: "${query.slice(0, 28)}"... `);

    const html = await fetchHtml(url, 10_000);
    if (!html) {
      console.log('실패');
      continue;
    }

    const $ = load(html);

    // Naver 검색 결과 HTML에서 블로그/티스토리 URL 추출
    $('a').each((_, a) => {
      const href = $(a).attr('href') ?? '';
      // 네이버 블로그 포스트: /blogId/logNo 형태
      if (/blog\.naver\.com\/[A-Za-z0-9_]+\/\d+/.test(href)) {
        links.add(href.split('?')[0]);
      }
      // 티스토리 포스트
      if (/[a-z0-9-]+\.tistory\.com\/\d+/.test(href)) {
        links.add(href.split('?')[0]);
      }
    });

    // data-url 속성에 숨겨진 링크도 확인
    $('[data-url]').each((_, el) => {
      const href = $(el).attr('data-url') ?? '';
      if (/blog\.naver\.com\/[A-Za-z0-9_]+\/\d+/.test(href)) {
        links.add(href.split('?')[0]);
      }
    });

    console.log(`${links.size}개 누적`);
    if (links.size >= 6) break;
  }

  return [...links].slice(0, 6);
}

/** 네이버 블로그 포스트 본문 추출 (PostView iframe 우회) */
async function fetchNaverBlogContent(url: string): Promise<string | null> {
  const m = url.match(/blog\.naver\.com\/([A-Za-z0-9_]+)\/(\d+)/);
  if (!m) return null;
  const [, blogId, logNo] = m;

  // PostView.nhn 으로 직접 접근 (JS 없이도 본문이 포함됨)
  const pvUrl = `https://blog.naver.com/PostView.nhn?blogId=${blogId}&logNo=${logNo}&redirect=Dlog&widgetTypeCall=true`;
  const html = await fetchHtml(pvUrl);
  if (!html) return null;

  const $ = load(html);
  return (
    $('#postViewArea').text() ||
    $('.se-main-container').text() ||
    $('.post-view').text() ||
    $('body').text() ||
    null
  );
}

/** 티스토리 포스트 본문 추출 */
async function fetchTistoryContent(url: string): Promise<string | null> {
  const html = await fetchHtml(url);
  if (!html) return null;

  const $ = load(html);
  return (
    $('.entry-content').text() ||
    $('article').text() ||
    $('.article-view').text() ||
    $('.tt_article_useless_p_margin').text() ||
    $('body').text() ||
    null
  );
}

/**
 * URL 종류에 따라 적절한 본문 추출 함수를 호출하고
 * { text, title } 형태로 반환한다.
 */
async function fetchBlogContent(
  url: string,
): Promise<{ text: string; title: string } | null> {
  process.stdout.write(`  📖 ${url.slice(0, 65)}... `);

  let text: string | null = null;
  let html: string | null = null;

  if (url.includes('blog.naver.com')) {
    text = await fetchNaverBlogContent(url);
    // title은 원본 URL에서 가져옴
    html = await fetchHtml(url);
  } else {
    html = await fetchHtml(url);
    if (html) {
      const $ = load(html);
      text =
        url.includes('tistory.com')
          ? await fetchTistoryContent(url)
          : $('article, main, .content, .post-content').first().text() ||
            $('body').text();
    }
  }

  if (!text || text.trim().length < 200) {
    console.log('내용 없음');
    return null;
  }

  const title = html
    ? load(html)('title').first().text().trim() || url
    : url;

  console.log(`${(text.length / 1000).toFixed(1)}KB`);
  return { text, title };
}

/**
 * Naver 블로그 + 티스토리에서 기수 관련 포스트를 검색·파싱해
 * 출연자 목록을 반환한다.
 */
async function fetchBlogSources(seasonNo: number): Promise<RawParticipant[]> {
  const urls = await searchNaverBlog(seasonNo);
  const participants: RawParticipant[] = [];

  for (const url of urls) {
    const result = await fetchBlogContent(url);
    if (!result) continue;

    if (!result.text.includes(`${seasonNo}기`)) {
      console.log(`  ↳ ${seasonNo}기 언급 없음`);
      continue;
    }

    const parsed = parseArticleText(result.text, url, result.title);
    if (parsed.length > 0) {
      console.log(`  ↳ ${parsed.length}명 추출`);
      participants.push(...parsed);
    }
  }

  return participants;
}

// ─── Profile text extractor ──────────────────────────────────────────────────

/** 텍스트 블록에서 프로필 필드 추출 */
function extractProfile(
  handle: string,
  gender: Gender,
  text: string,
  sourceUrl: string,
): RawParticipant {
  const issues: string[] = [];

  // 생년 추출
  let birthYear: number | null = null;
  const by4 = text.match(/(\d{4})\s*년\s*생/);
  const by2 = text.match(/(\d{2})\s*년\s*생/);
  const ageMatch = text.match(/만?\s*(\d{2})\s*세/);
  if (by4) {
    birthYear = parseInt(by4[1]);
  } else if (by2) {
    const y = parseInt(by2[1]);
    birthYear = y <= 30 ? 2000 + y : 1900 + y;
  } else if (ageMatch) {
    // 한국 나이 기준 역산 (현재 연도 2026 기준)
    birthYear = 2026 - parseInt(ageMatch[1]);
  }

  // 직업 추출
  let job: string | null = null;
  const jobKeyword = text.match(
    /(?:직업|직종|현직|직위|하는\s*일)\s*[:：]\s*([^\n,。；]+)/,
  );
  if (jobKeyword) {
    job = jobKeyword[1].trim().slice(0, 60);
  } else {
    // 직업명 패턴으로 탐색
    const jobPattern =
      /([가-힣a-zA-Z\s]{2,20}(?:의사|변호사|약사|간호사|교사|교수|연구원|엔지니어|개발자|디자이너|공무원|경찰|군인|대표|CEO|강사|원장|작가|PD|기획자|매니저|컨설턴트|회계사|치과|한의사|수의사)[가-힣a-zA-Z\s]{0,20})/;
    const jm = text.match(jobPattern);
    if (jm) job = jm[1].trim().slice(0, 60);
  }
  if (!job) issues.push('직업 정보 자동 추출 실패 - 수동 입력 필요');

  // 지역 추출
  let region: string | null = null;
  const regionKw = text.match(
    /(?:거주지|거주|출신|사는\s*곳)\s*[:：]?\s*([가-힣]+(?:\s+[가-힣]+)?)/,
  );
  if (regionKw) {
    region = regionKw[1].trim();
  } else {
    const rm = text.match(/([가-힣]+(?:특별시|광역시|특별자치시|시|군|구|도))\s*(?:거주|출신|에\s*살)/);
    if (rm) region = rm[1];
  }

  // 특징/취미 추출
  const traits: string[] = [];
  const traitMatches = text.matchAll(
    /(?:특징|취미|장점|스펙|어필)\s*[:：]\s*([^\n]+)/g,
  );
  for (const m of traitMatches) {
    const val = m[1].trim();
    if (val && val.length < 60) traits.push(val);
  }

  // 명언 추출
  const notableQuotes: string[] = [];
  const quoteMatches = text.matchAll(/["""「]([^"""」]{8,80})["""」]/g);
  for (const m of quoteMatches) {
    notableQuotes.push(m[1].trim());
  }

  if (!birthYear) issues.push('생년 정보 자동 추출 실패 - 수동 입력 필요');

  return {
    handle,
    gender,
    birthYear,
    job,
    region,
    traits: traits.slice(0, 5),
    notableQuotes: notableQuotes.slice(0, 3),
    issues,
    sources: [
      {
        title: `namu.moe: 나는 SOLO ${handle}`,
        url: sourceUrl,
        confidence: 'medium',
      },
    ],
  };
}

// ─── News search & parse ──────────────────────────────────────────────────────

/** DuckDuckGo Lite에서 뉴스 기사 URL 검색 */
async function searchNewsUrls(seasonNo: number): Promise<string[]> {
  const query = `나는 SOLO ${seasonNo}기 출연자 직업 나이`;
  const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;

  process.stdout.write(`  🔍 "${query}" 검색 중... `);
  const html = await fetchHtml(url, 8_000);
  if (!html) {
    console.log('실패');
    return [];
  }

  const $ = load(html);
  const links: string[] = [];

  $('a').each((_, a) => {
    const href = $(a).attr('href') ?? '';
    // OSEN, MK, 텐아시아, bnt, Daum, Naver 뉴스만
    if (!/osen\.co\.kr|mk\.co\.kr|tenasia|bnt|v\.daum\.net|n\.news\.naver/.test(href)) return;
    const clean = href.startsWith('//') ? `https:${href}` : href;
    if (clean.startsWith('http') && !links.includes(clean)) links.push(clean);
  });

  // DDG redirect 파라미터에서도 URL 추출
  $('a[href*="uddg="]').each((_, a) => {
    try {
      const raw = $(a).attr('href') ?? '';
      const uddg = new URL(`https://x.com${raw}`).searchParams.get('uddg');
      if (uddg && /osen\.co\.kr|mk\.co\.kr|daum\.net|naver\.com/.test(uddg)) {
        const decoded = decodeURIComponent(uddg);
        if (!links.includes(decoded)) links.push(decoded);
      }
    } catch {
      /* ignore */
    }
  });

  console.log(`${links.length}개 링크 발견`);
  return links.slice(0, 4);
}

/** 뉴스 기사에서 출연자 프로필 추출 */
async function fetchNewsParticipants(
  urls: string[],
  seasonNo: number,
): Promise<RawParticipant[]> {
  const participants: RawParticipant[] = [];

  for (const url of urls) {
    process.stdout.write(`  📰 ${url.slice(0, 65)}... `);
    const html = await fetchHtml(url);
    if (!html) {
      console.log('실패');
      continue;
    }
    const $ = load(html);
    const articleText =
      $('article, .article_body, #articleBodyContents, .news_content, .article-body, main')
        .first()
        .text() || $('body').text();

    if (!articleText.includes(`${seasonNo}기`)) {
      console.log('관련 없음');
      continue;
    }

    const title =
      $('title').text().trim() || $('h1').first().text().trim() || url;
    console.log('파싱');

    const parsed = parseArticleText(articleText, url, title);
    participants.push(...parsed);
  }

  return participants;
}

/**
 * 기사 텍스트에서 출연자별 프로필 블록 추출.
 * 나는 SOLO 가명 패턴(영수, 정숙, …)을 기준으로 주변 텍스트를 컨텍스트로 삼는다.
 */
function parseArticleText(
  text: string,
  url: string,
  title: string,
): RawParticipant[] {
  const MALE_HANDLES = ['영수', '영호', '영식', '영철', '광수', '상철', '경수'];
  const FEMALE_HANDLES = ['영숙', '정숙', '순자', '옥순', '영자', '현숙', '정희'];

  const participants: RawParticipant[] = [];
  const confidence: Confidence =
    /osen\.co\.kr|mk\.co\.kr/.test(url) ? 'high' : 'medium';

  const tryExtract = (handle: string, gender: Gender) => {
    if (!text.includes(handle)) return;

    // 이름 주변 200자 컨텍스트 (앞 50 + 뒤 300)
    const idx = text.indexOf(handle);
    const ctx = text.slice(Math.max(0, idx - 50), idx + 300);

    const p = extractProfile(handle, gender, ctx, url);
    p.sources[0] = { title, url, confidence };
    participants.push(p);
  };

  MALE_HANDLES.forEach((h) => tryExtract(h, 'M'));
  FEMALE_HANDLES.forEach((h) => tryExtract(h, 'F'));

  return participants;
}

// ─── Merge & deduplicate ──────────────────────────────────────────────────────

function mergeParticipants(lists: RawParticipant[][]): RawParticipant[] {
  const map = new Map<string, RawParticipant>();

  for (const list of lists) {
    for (const p of list) {
      const key = `${p.gender}-${p.handle}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { ...p });
        continue;
      }
      // 필드 보강
      if (!existing.birthYear && p.birthYear) existing.birthYear = p.birthYear;
      if (!existing.job && p.job) existing.job = p.job;
      if (!existing.region && p.region) existing.region = p.region;
      existing.traits = [...new Set([...existing.traits, ...p.traits])].slice(0, 5);
      // 중복 소스 제거
      const newSources = p.sources.filter(
        (s) => !existing.sources.some((es) => es.url === s.url),
      );
      existing.sources.push(...newSources);
      // 정보가 채워진 이슈 제거
      existing.issues = existing.issues.filter((issue) => {
        if (issue.includes('직업') && existing.job) return false;
        if (issue.includes('생년') && existing.birthYear) return false;
        return true;
      });
    }
  }

  return [...map.values()];
}

// ─── TypeScript code generator ────────────────────────────────────────────────

function fmtStr(v: string | null): string {
  return v === null ? 'null' : JSON.stringify(v);
}

function fmtArr(arr: string[]): string {
  return arr.length === 0 ? '[]' : `[${arr.map((s) => JSON.stringify(s)).join(', ')}]`;
}

function generateParticipantTs(p: RawParticipant, seasonNo: number): string {
  const sourcesTs = p.sources
    .map(
      (s) =>
        `          {\n            title: ${fmtStr(s.title)},\n            url: ${fmtStr(s.url)},\n            confidence: "${s.confidence}",\n          }`,
    )
    .join(',\n');

  return `      {
        seasonNo: ${seasonNo},
        gender: "${p.gender}",
        handle: ${fmtStr(p.handle)},
        photo: { src: null, alt: ${fmtStr(`나는 SOLO ${seasonNo}기 ${p.handle}`)} },
        instagram: null,
        profile: {
          birthYear: ${p.birthYear ?? 'null'},
          ageKorean: null,
          job: ${fmtStr(p.job)},
          region: ${fmtStr(p.region)},
          traits: ${fmtArr(p.traits)},
          notableQuotes: ${fmtArr(p.notableQuotes)},
          issues: ${fmtArr(p.issues)},
        },
        sources: [
${sourcesTs}
        ],
      }`;
}

function generateSeasonTs(season: RawSeason): string {
  // 남자 먼저, 여자 뒤
  const sorted = [
    ...season.participants.filter((p) => p.gender === 'M'),
    ...season.participants.filter((p) => p.gender === 'F'),
  ];

  const participantsTs = sorted
    .map((p) => generateParticipantTs(p, season.seasonNo))
    .join(',\n');

  const episodesTs =
    season.episodes.length > 0
      ? '\n' +
        season.episodes
          .map((e) => `      { ep: ${e.ep}, airDate: ${fmtStr(e.airDate)} }`)
          .join(',\n') +
        '\n    '
      : '\n      // TODO: 에피소드 번호·방영일 입력 필요\n    ';

  return `  {
    seasonNo: ${season.seasonNo},
    label: ${fmtStr(season.label)},
    episodes: [${episodesTs}],
    participants: [
${participantsTs},
    ],
  }`;
}

// ─── Empty template (크롤 실패 시) ────────────────────────────────────────────

function makeEmptyTemplate(seasonNo: number): RawParticipant[] {
  const maleHandles = ['영수', '영호', '영식', '영철', '광수', '상철'];
  const femaleHandles = ['영숙', '정숙', '순자', '옥순', '영자', '현숙'];
  return [
    ...maleHandles.map((handle) => makeEmpty(handle, 'M')),
    ...femaleHandles.map((handle) => makeEmpty(handle, 'F')),
  ];
}

function makeEmpty(handle: string, gender: Gender): RawParticipant {
  return {
    handle,
    gender,
    birthYear: null,
    job: null,
    region: null,
    traits: [],
    notableQuotes: [],
    issues: ['자동 수집 실패 - 모든 필드 수동 입력 필요'],
    sources: [{ title: 'TODO', url: '', confidence: 'low' }],
  };
}

// ─── data.ts injector ─────────────────────────────────────────────────────────

async function injectIntoDataTs(seasonTs: string, seasonNo: number): Promise<void> {
  const dataPath = path.join(
    process.cwd(),
    'src',
    'entities',
    'participant',
    'lib',
    'data.ts',
  );
  const content = await fs.readFile(dataPath, 'utf-8');

  // 중복 확인
  if (new RegExp(`seasonNo:\\s*${seasonNo},`).test(content)) {
    console.error(`\n⚠️  ${seasonNo}기 데이터가 이미 data.ts에 존재합니다. 삽입을 건너뜁니다.`);
    return;
  }

  const marker = 'export const SEASONS_DATA: Season[] = [';
  const idx = content.indexOf(marker);
  if (idx === -1) {
    console.error('\n❌ data.ts에서 SEASONS_DATA 배열을 찾을 수 없습니다.');
    process.exit(1);
  }

  // 배열 시작 바로 뒤에 삽입 (최신→오래된 순 유지)
  const insertAt = idx + marker.length;
  const newContent =
    content.slice(0, insertAt) +
    '\n' +
    seasonTs +
    ',\n' +
    content.slice(insertAt);

  await fs.writeFile(dataPath, newContent, 'utf-8');
  console.log(`\n✅ data.ts에 ${seasonNo}기 데이터 삽입 완료`);
  console.log('   ※ SEASONS_DATA 배열이 최신기수→오래된기수 순서인지 확인하세요.');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const seasonNo = parseInt(args.find((a) => /^\d+$/.test(a)) ?? '');
  const doInject = args.includes('--inject');

  if (isNaN(seasonNo) || seasonNo < 1 || seasonNo > 99) {
    console.error(
      `사용법: npm run crawl-season -- <기수번호> [--inject]\n\n` +
        `예시:\n` +
        `  npm run crawl-season -- 26            # 26기 초안 파일 생성\n` +
        `  npm run crawl-season -- 26 --inject   # 생성 후 data.ts에 자동 삽입`,
    );
    process.exit(1);
  }

  console.log(`\n📺 나는 SOLO ${seasonNo}기 데이터 수집\n${'─'.repeat(55)}`);

  // ── Step 1: Naver 블로그 / 티스토리 ──
  console.log('\n[1/3] Naver 블로그 / 티스토리 크롤링...');
  const blogParticipants = await fetchBlogSources(seasonNo);

  // ── Step 2: 뉴스 기사 ──
  console.log('\n[2/3] 뉴스 기사 검색 및 파싱...');
  const newsUrls = await searchNewsUrls(seasonNo);
  const newsParticipants = await fetchNewsParticipants(newsUrls, seasonNo);

  // ── Step 3: 병합 ──
  console.log('\n[3/3] 데이터 병합...');
  let participants = mergeParticipants([
    blogParticipants,
    newsParticipants,
  ]);

  if (participants.length === 0) {
    console.log('  ⚠️  자동 수집 실패. 빈 템플릿으로 생성합니다.');
    participants = makeEmptyTemplate(seasonNo);
  }

  const males = participants.filter((p) => p.gender === 'M');
  const females = participants.filter((p) => p.gender === 'F');
  const missing = participants.filter((p) => !p.birthYear || !p.job);

  console.log(`  수집: 남 ${males.length}명 / 여 ${females.length}명`);
  if (missing.length)
    console.log(`  수동 입력 필요: ${missing.map((p) => p.handle).join(', ')}`);

  const season: RawSeason = {
    seasonNo,
    label: `${seasonNo}기`, // TODO: 특집 타이틀은 수동 입력
    episodes: [],
    participants,
  };

  const tsCode = generateSeasonTs(season);
  const banner = [
    `// 나는 SOLO ${seasonNo}기 자동 수집 초안`,
    `// 생성: ${new Date().toISOString()}`,
    `// ⚠️  data.ts에 추가하기 전에 반드시 아래 항목을 확인하세요:`,
    `//   - label (특집 타이틀)`,
    `//   - episodes (에피소드 번호·방영일)`,
    `//   - 각 출연자 직업·나이·지역 (issues 배열 확인)`,
    `//   - instagram 필드 (실제 username 확인 시 입력)`,
    '',
  ].join('\n');

  // 초안 파일 저장
  const outDir = path.join(process.cwd(), 'scripts', 'output');
  await fs.mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, `season-${seasonNo}-draft.ts`);
  await fs.writeFile(outFile, banner + tsCode + '\n', 'utf-8');

  console.log(`\n✅ 초안 파일: ${outFile}`);

  if (doInject) {
    await injectIntoDataTs(tsCode, seasonNo);
  } else {
    console.log(`\n다음 단계:`);
    console.log(`  1. ${outFile} 열어서 내용 검토 및 수동 수정`);
    console.log(
      `  2. npm run crawl-season -- ${seasonNo} --inject   ← data.ts에 자동 삽입`,
    );
    console.log(`     또는 직접 SEASONS_DATA 배열 맨 앞에 붙여넣기`);
  }
}

main().catch((e) => {
  console.error('\n❌ 오류:', e instanceof Error ? e.message : e);
  process.exit(1);
});
