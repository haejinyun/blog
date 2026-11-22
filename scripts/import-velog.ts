/**
 * velog 시리즈 하나, 또는 시리즈에 속하지 않은 글 하나를 content/ 로 가져온다. (SPEC 11장)
 *
 * 사용법: pnpm import:velog --username <아이디> (--series <시리즈 slug> | --post <글 slug>) [--force]
 *
 * - velog 공개 GraphQL API 를 읽기만 한다 (로그인 토큰 없음 → 비공개 글은 가져오지 않음).
 * - 글: content/posts/YYYY/MM/<url_slug>/index.md (날짜 폴더는 released_at 의 한국 시간 기준)
 * - 이미지: 본문 이미지와 velog 썸네일(메인 이미지)을 글 폴더에 내려받고 본문은 상대 경로로 바꾼다.
 *   메인 이미지는 frontmatter thumbnail 이 되어 글 상단, 블로그 목록, 썸네일로 쓰인다.
 * - 시리즈: content/series/<시리즈 slug>.md (--post 로 가져온 글은 velog 에서 시리즈에 속해 있어도 시리즈 없이 저장)
 * - 이미 있는 글·시리즈 파일은 건너뛴다 (로컬에서 고친 내용 보호). --force 일 때만 덮어쓴다.
 *
 * Node 22 의 TypeScript 타입 제거 기능으로 바로 실행한다 (타입 외의 TS 전용 문법은 쓰지 않는다).
 */
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseArgs } from 'node:util';

const VELOG_GRAPHQL_URL = 'https://v2.velog.io/graphql';
const TIME_ZONE = 'Asia/Seoul';
const CONTENT_DIR = join(process.cwd(), 'content');
const POSTS_DIR = join(CONTENT_DIR, 'posts');
const SERIES_DIR = join(CONTENT_DIR, 'series');

interface VelogSeries {
  name: string;
  description: string | null;
  url_slug: string;
  series_posts: { index: number; post: { url_slug: string; is_private: boolean } }[];
}

interface VelogPost {
  title: string;
  url_slug: string;
  short_description: string | null;
  tags: string[] | null;
  thumbnail: string | null;
  released_at: string;
  updated_at: string;
  body: string;
}

interface ImportOptions {
  username: string;
  force: boolean;
}

/** 가져올 대상: 시리즈 전체 또는 글 하나 */
type ImportTarget = { kind: 'series'; slug: string } | { kind: 'post'; slug: string };

/** 글이 속한 시리즈와 순서 (frontmatter series·seriesOrder) */
interface SeriesPlacement {
  seriesSlug: string;
  order: number;
}

const USAGE =
  '사용법: pnpm import:velog --username <아이디> (--series <시리즈 slug> | --post <글 slug>) [--force]';

type ImportStatus = 'created' | 'overwritten' | 'skipped';

// ───────────────────────── velog API

async function queryVelog<T>(query: string, variables: Record<string, string>): Promise<T> {
  const response = await fetch(VELOG_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) {
    throw new Error(`velog API 요청 실패: ${response.status} ${response.statusText}`);
  }
  const result = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (result.errors?.length) {
    throw new Error(`velog API 오류: ${result.errors.map((error) => error.message).join(', ')}`);
  }
  if (!result.data) throw new Error('velog API 응답에 data 가 없습니다');
  return result.data;
}

async function fetchSeries(username: string, seriesSlug: string): Promise<VelogSeries> {
  const { series } = await queryVelog<{ series: VelogSeries | null }>(
    `query ($username: String, $slug: String) {
      series(username: $username, url_slug: $slug) {
        name description url_slug
        series_posts { index post { url_slug is_private } }
      }
    }`,
    { username, slug: seriesSlug },
  );
  if (!series) throw new Error(`시리즈를 찾을 수 없습니다: @${username}/series/${seriesSlug}`);
  return series;
}

async function fetchPost(username: string, postSlug: string): Promise<VelogPost> {
  const { post } = await queryVelog<{ post: VelogPost | null }>(
    `query ($username: String, $slug: String) {
      post(username: $username, url_slug: $slug) {
        title url_slug short_description tags thumbnail released_at updated_at body
      }
    }`,
    { username, slug: postSlug },
  );
  if (!post) throw new Error(`글을 찾을 수 없습니다: @${username}/${postSlug}`);
  return post;
}

// ───────────────────────── 날짜

/** ISO 8601 → 한국 시간 기준 { year, month, day } */
function toKstDateParts(isoDate: string): { year: string; month: string; day: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(isoDate));
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return { year: pick('year'), month: pick('month'), day: pick('day') };
}

function toKstDate(isoDate: string): string {
  const { year, month, day } = toKstDateParts(isoDate);
  return `${year}-${month}-${day}`;
}

// ───────────────────────── 이미지

/** 본문의 마크다운 이미지 중 원격 URL 목록 (등장 순서, 중복 제거) */
function extractRemoteImageUrls(body: string): string[] {
  const urls = [...body.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)/g)].map((match) => match[1]);
  return [...new Set(urls.filter((url): url is string => Boolean(url)))];
}

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

function guessImageExtension(url: string, contentType: string | null): string {
  const fromPath = new URL(url).pathname.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (fromPath) return fromPath === 'jpeg' ? 'jpg' : fromPath;
  const fromType = contentType && EXTENSION_BY_CONTENT_TYPE[contentType.split(';')[0] ?? ''];
  if (fromType) return fromType;
  throw new Error(`이미지 확장자를 알 수 없습니다: ${url}`);
}

/** 이미지를 dir/<baseName>.<ext> 로 내려받고 파일명을 돌려준다. */
async function downloadImage(url: string, dir: string, baseName: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`이미지 다운로드 실패 (${response.status}): ${url}`);
  const fileName = `${baseName}.${guessImageExtension(url, response.headers.get('content-type'))}`;
  writeFileSync(join(dir, fileName), Buffer.from(await response.arrayBuffer()));
  return fileName;
}

/** 본문 이미지를 image-1, image-2 ... 로, 썸네일을 thumbnail 로 내려받는다. 같은 URL 은 한 번만 받는다. */
async function downloadPostImages(post: VelogPost, dir: string): Promise<Map<string, string>> {
  const fileNameByUrl = new Map<string, string>();
  const bodyImageUrls = extractRemoteImageUrls(post.body);

  for (const [index, url] of bodyImageUrls.entries()) {
    fileNameByUrl.set(url, await downloadImage(url, dir, `image-${index + 1}`));
  }
  if (post.thumbnail && !fileNameByUrl.has(post.thumbnail)) {
    fileNameByUrl.set(post.thumbnail, await downloadImage(post.thumbnail, dir, 'thumbnail'));
  }
  return fileNameByUrl;
}

function rewriteImageUrls(body: string, fileNameByUrl: Map<string, string>): string {
  let rewritten = body;
  for (const [url, fileName] of fileNameByUrl) {
    rewritten = rewritten.replaceAll(`](${url}`, `](./${fileName}`);
  }
  return rewritten;
}

// ───────────────────────── 파일 생성

/** frontmatter 값은 JSON 문자열로 쓴다 (JSON 은 유효한 YAML 이라 따옴표·특수문자 처리가 안전하다). */
function renderFrontmatter(fields: Record<string, unknown>, comments: string[]): string {
  const lines = Object.entries(fields)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
  return ['---', ...comments.map((comment) => `# ${comment}`), ...lines, '---'].join('\n');
}

function normalizeDescription(text: string | null, fallback: string): string {
  const normalized = (text ?? '').replace(/\s+/g, ' ').trim();
  return normalized || fallback;
}

function renderPostFile(
  post: VelogPost,
  placement: SeriesPlacement | undefined,
  username: string,
  fileNameByUrl: Map<string, string>,
): string {
  const isUpdatedOnDifferentDay = toKstDate(post.updated_at) !== toKstDate(post.released_at);
  const thumbnail = post.thumbnail ? fileNameByUrl.get(post.thumbnail) : undefined;

  const frontmatter = renderFrontmatter(
    {
      title: post.title,
      description: normalizeDescription(post.short_description, post.title),
      date: post.released_at,
      updated: isUpdatedOnDifferentDay ? post.updated_at : undefined,
      tags: post.tags ?? [],
      series: placement?.seriesSlug,
      seriesOrder: placement?.order,
      thumbnail: thumbnail ? `./${thumbnail}` : undefined,
    },
    [`velog 에서 가져옴: https://velog.io/@${username}/${post.url_slug}`],
  );
  const body = rewriteImageUrls(post.body, fileNameByUrl).trim();
  return `${frontmatter}\n\n${body}\n`;
}

function renderSeriesFile(series: VelogSeries, username: string): string {
  const description = normalizeDescription(series.description, series.name);
  const frontmatter = renderFrontmatter({ title: series.name, description }, [
    `velog 에서 가져옴: https://velog.io/@${username}/series/${series.url_slug}`,
    '소개 본문은 직접 고쳐도 된다 (다시 가져와도 --force 가 아니면 덮어쓰지 않는다)',
  ]);
  return `${frontmatter}\n\n${description}\n`;
}

/** 같은 slug 의 글 폴더를 날짜 폴더와 상관없이 찾는다 (content/posts/YYYY/MM/<slug>) */
function findPostDirs(slug: string): string[] {
  if (!existsSync(POSTS_DIR)) return [];
  return readdirSync(POSTS_DIR, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name === slug)
    .map((entry) => join(entry.parentPath, entry.name))
    .filter((dir) => relative(POSTS_DIR, dir).split('/').length === 3);
}

// ───────────────────────── 가져오기

async function importPost(
  postSlug: string,
  placement: SeriesPlacement | undefined,
  options: ImportOptions,
): Promise<{ status: ImportStatus; path: string; imageCount: number }> {
  const existingDirs = findPostDirs(postSlug);
  if (existingDirs.length > 0 && !options.force) {
    return {
      status: 'skipped',
      path: relative(process.cwd(), existingDirs[0] ?? ''),
      imageCount: 0,
    };
  }

  const post = await fetchPost(options.username, postSlug);
  const { year, month } = toKstDateParts(post.released_at);
  const targetDir = join(POSTS_DIR, year, month, post.url_slug);
  const tempDir = `${targetDir}.importing`;

  // 임시 폴더에 완성한 뒤 옮긴다. 중간에 실패해도 반쯤 만든 글이 남지 않는다.
  rmSync(tempDir, { recursive: true, force: true });
  mkdirSync(tempDir, { recursive: true });
  try {
    const fileNameByUrl = await downloadPostImages(post, tempDir);
    writeFileSync(
      join(tempDir, 'index.md'),
      renderPostFile(post, placement, options.username, fileNameByUrl),
    );
    for (const dir of existingDirs) rmSync(dir, { recursive: true, force: true });
    renameSync(tempDir, targetDir);
    return {
      status: existingDirs.length > 0 ? 'overwritten' : 'created',
      path: relative(process.cwd(), targetDir),
      imageCount: fileNameByUrl.size,
    };
  } catch (error) {
    rmSync(tempDir, { recursive: true, force: true });
    throw error;
  }
}

function importSeriesFile(series: VelogSeries, options: ImportOptions): ImportStatus {
  const file = join(SERIES_DIR, `${series.url_slug}.md`);
  const exists = existsSync(file);
  if (exists && !options.force) return 'skipped';

  mkdirSync(SERIES_DIR, { recursive: true });
  writeFileSync(file, renderSeriesFile(series, options.username));
  return exists ? 'overwritten' : 'created';
}

function parseArguments(): { options: ImportOptions; target: ImportTarget } {
  const { values } = parseArgs({
    options: {
      username: { type: 'string' },
      series: { type: 'string' },
      post: { type: 'string' },
      force: { type: 'boolean', default: false },
    },
  });
  if (!values.username) throw new Error(USAGE);
  if (Boolean(values.series) === Boolean(values.post)) throw new Error(USAGE);

  const options = { username: values.username, force: values.force ?? false };
  if (values.series) return { options, target: { kind: 'series', slug: values.series } };
  return { options, target: { kind: 'post', slug: values.post ?? '' } };
}

async function importSeries(seriesSlug: string, options: ImportOptions): Promise<void> {
  const series = await fetchSeries(options.username, seriesSlug);
  const seriesPosts = [...series.series_posts].sort((a, b) => a.index - b.index);

  console.log(`시리즈 "${series.name}" (${seriesPosts.length}편)`);
  console.log(`  시리즈 파일: ${importSeriesFile(series, options)}`);

  for (const { index, post } of seriesPosts) {
    if (post.is_private) {
      console.log(`  ${index}. ${post.url_slug}: 비공개 글이라 건너뜀`);
      continue;
    }
    const placement = { seriesSlug: series.url_slug, order: index };
    const result = await importPost(post.url_slug, placement, options);
    console.log(`  ${index}. ${result.status} ${result.path} (이미지 ${result.imageCount}개)`);
  }
}

async function importSinglePost(postSlug: string, options: ImportOptions): Promise<void> {
  const result = await importPost(postSlug, undefined, options);
  console.log(`글 ${result.status} ${result.path} (이미지 ${result.imageCount}개)`);
}

async function main(): Promise<void> {
  const { options, target } = parseArguments();
  if (target.kind === 'series') {
    await importSeries(target.slug, options);
    return;
  }
  await importSinglePost(target.slug, options);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
