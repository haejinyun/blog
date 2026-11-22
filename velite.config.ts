import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { assets, defineCollection, defineConfig, s } from 'velite';

/**
 * 콘텐츠 빌드 설정.
 * 이 파일은 "파일 → 검증된 데이터" 변환만 담당한다.
 * 페이지는 이 결과를 lib/content 의 Repository 를 통해서만 읽는다.
 */

const ASSET_BASE_URL = '/static/';

/**
 * 글은 .mdx 또는 .md. MDX 컴파일러가 파일 확장자를 보고(format: 'detect') .md 는 일반 마크다운으로 해석한다.
 * .md 의 HTML(<br> 등)은 rehype-raw 가 처리한다. MDX 전용 노드는 그대로 통과시킨다.
 */
const rehypeRawOptions = {
  passThrough: [
    'mdxjsEsm',
    'mdxFlowExpression',
    'mdxJsxFlowElement',
    'mdxJsxTextElement',
    'mdxTextExpression',
  ],
};

const posts = defineCollection({
  name: 'Post',
  pattern: 'posts/**/index.{md,mdx}',
  schema: s
    .object({
      title: s.string().min(1),
      description: s.string().min(1),
      date: s.isodate(),
      updated: s.isodate().optional(),
      tags: s.array(s.string().min(1)),
      series: s.string().min(1).optional(),
      seriesOrder: s.number().int().positive().optional(),
      thumbnail: s.image().optional(),
      draft: s.boolean().default(false),
      sourcePath: s.path(),
      raw: s.raw(),
      toc: s.toc({ maxDepth: 3 }),
      body: s.mdx(),
    })
    .transform(({ sourcePath, raw, thumbnail, ...post }) => ({
      ...post,
      slug: extractSlugFromPath(sourcePath),
      sourcePath,
      thumbnail: thumbnail?.src,
      previewImage: thumbnail?.src ?? findFirstBodyImage(post.body),
      readingMinutes: estimateReadingMinutes(raw),
    })),
});

const series = defineCollection({
  name: 'Series',
  pattern: 'series/*.md',
  schema: s
    .object({
      title: s.string().min(1),
      description: s.string().min(1),
      sourcePath: s.path(),
      body: s.mdx(),
    })
    .transform(({ sourcePath, ...entry }) => ({
      ...entry,
      slug: extractSlugFromPath(sourcePath),
    })),
});

const YEAR_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const MAX_FEATURED_PROJECTS = 3;

const projects = defineCollection({
  name: 'Project',
  pattern: 'projects/*/index.{md,mdx}',
  schema: s
    .object({
      title: s.string().min(1),
      description: s.string().min(1),
      startDate: s.string().regex(YEAR_MONTH_PATTERN, 'YYYY-MM 형식이어야 합니다'),
      endDate: s.string().regex(YEAR_MONTH_PATTERN, 'YYYY-MM 형식이어야 합니다').optional(),
      role: s.string().min(1),
      techStack: s.array(s.string().min(1)).min(1),
      links: s.array(s.object({ label: s.string().min(1), url: s.string().url() })).default([]),
      thumbnail: s.image().optional(),
      featured: s.boolean().default(false),
      featuredOrder: s.number().int().positive().optional(),
      draft: s.boolean().default(false),
      sourcePath: s.path(),
      toc: s.toc({ maxDepth: 3 }),
      body: s.mdx(),
    })
    .transform(({ sourcePath, thumbnail, ...project }) => ({
      ...project,
      slug: extractSlugFromPath(sourcePath),
      sourcePath,
      thumbnail: thumbnail?.src,
    })),
});

const about = defineCollection({
  name: 'About',
  pattern: 'about.mdx',
  single: true,
  schema: s.object({
    title: s.string().min(1),
    description: s.string().min(1),
    updated: s.isodate(),
    resumePdf: s.file().optional(),
    body: s.mdx(),
  }),
});

/**
 * 읽는 시간(분). Velite 의 s.metadata() 는 한글을 세지 않아 한국어 글이 모두 1분이 되므로 직접 계산한다.
 * 한글·한자·가나는 글자 수 / 분당 500자, 영어는 단어 수 / 분당 265단어 (Velite 와 같은 값)
 */
const CJK_CHARS_PER_MINUTE = 500;
const LATIN_WORDS_PER_MINUTE = 265;

function estimateReadingMinutes(text: string): number {
  const cjkChars = text.match(
    /[\p{Script=Hangul}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu,
  );
  const latinWords = text.match(/[a-zA-Z]+(?:['’][a-zA-Z]+)*/g);
  const minutes =
    (cjkChars?.length ?? 0) / CJK_CHARS_PER_MINUTE +
    (latinWords?.length ?? 0) / LATIN_WORDS_PER_MINUTE;
  return Math.max(1, Math.round(minutes));
}

const IMAGE_EXTENSIONS = 'png|jpe?g|gif|webp|avif|svg';

/** 컴파일된 본문에서 처음 나오는 이미지 경로 ('/static/image-1-1234abcd.png'). 목록 미리보기용 */
function findFirstBodyImage(body: string): string | undefined {
  const pattern = new RegExp(`${ASSET_BASE_URL}[^"'\\s)]+\\.(?:${IMAGE_EXTENSIONS})`, 'i');
  return body.match(pattern)?.[0];
}

/** 'posts/2026/11/hello-world' → 'hello-world', 'series/my-series' → 'my-series' */
function extractSlugFromPath(sourcePath: string): string {
  const slug = sourcePath.split('/').at(-1);
  if (!slug) {
    throw new Error(`[content] 경로에서 slug 를 추출할 수 없습니다: ${sourcePath}`);
  }
  return slug;
}

type PostEntry = {
  slug: string;
  sourcePath: string;
  series?: string;
  draft: boolean;
  body: string;
  thumbnail?: string;
};

/** 에셋을 참조할 수 있는 draft 가능 콘텐츠 (글, 프로젝트) */
type DraftableEntry = Pick<PostEntry, 'draft' | 'body' | 'thumbnail'>;

type ProjectEntry = { sourcePath: string; featured: boolean; draft: boolean };

/** 같은 slug 가 두 폴더 이상에 있으면 빌드를 실패시킨다. */
function assertUniqueSlugs(entries: PostEntry[]): void {
  const pathsBySlug = Map.groupBy(entries, (entry) => entry.slug);
  const duplicates = [...pathsBySlug].filter(([, group]) => group.length > 1);
  if (duplicates.length === 0) return;

  const detail = duplicates
    .map(([slug, group]) => `  - "${slug}": ${group.map((entry) => entry.sourcePath).join(', ')}`)
    .join('\n');
  throw new Error(
    `[content] slug 가 중복되었습니다. slug 는 전체 글에서 유일해야 합니다.\n${detail}`,
  );
}

/** 글이 참조하는 series 에 해당하는 content/series/<slug>.md 가 없으면 빌드를 실패시킨다. */
function assertSeriesExist(entries: PostEntry[], seriesSlugs: Set<string>): void {
  const missing = entries.filter((entry) => entry.series && !seriesSlugs.has(entry.series));
  if (missing.length === 0) return;

  const detail = missing
    .map((entry) => `  - ${entry.sourcePath}: series "${entry.series}"`)
    .join('\n');
  throw new Error(
    `[content] 존재하지 않는 시리즈를 참조했습니다. content/series/<slug>.md 를 만들어 주세요.\n${detail}`,
  );
}

/** 글 본문·썸네일이 참조하는 에셋 파일명 목록 ('/static/a-1234.png' → 'a-1234.png') */
function collectReferencedAssetNames(entry: DraftableEntry): string[] {
  const pattern = new RegExp(`${ASSET_BASE_URL}([^"'\\s)]+)`, 'g');
  const sources = [entry.body, entry.thumbnail ?? ''];
  return sources.flatMap((source) => [...source.matchAll(pattern)].map((match) => match[1] ?? ''));
}

/**
 * draft 글에서만 쓰는 에셋은 빌드 결과물로 복사되지 않게 한다.
 * (Velite 는 prepare 훅이 끝난 뒤 assets 맵에 있는 파일을 복사한다.)
 */
function excludeDraftOnlyAssets(entries: DraftableEntry[]): void {
  const publishedAssets = new Set(
    entries.filter((entry) => !entry.draft).flatMap(collectReferencedAssetNames),
  );
  const draftAssets = entries.filter((entry) => entry.draft).flatMap(collectReferencedAssetNames);

  for (const name of draftAssets) {
    if (publishedAssets.has(name)) continue;
    assets.delete(name);
  }
}

/** 홈에 보여줄 대표 프로젝트는 최대 3개. 넘으면 빌드를 실패시킨다. */
function assertFeaturedProjectLimit(entries: ProjectEntry[]): void {
  const featured = entries.filter((entry) => entry.featured && !entry.draft);
  if (featured.length <= MAX_FEATURED_PROJECTS) return;

  const detail = featured.map((entry) => `  - ${entry.sourcePath}`).join('\n');
  throw new Error(
    `[content] 대표 프로젝트(featured: true)는 최대 ${MAX_FEATURED_PROJECTS}개입니다. 현재 ${featured.length}개:\n${detail}`,
  );
}

export default defineConfig({
  root: 'content',
  strict: true,
  output: {
    data: '.velite',
    assets: 'public/static',
    base: ASSET_BASE_URL,
    name: '[name]-[hash:8].[ext]',
    clean: true,
  },
  mdx: {
    rehypePlugins: [[rehypeRaw, rehypeRawOptions], rehypeSlug],
  },
  collections: { posts, series, projects, about },
  prepare: ({ posts, series, projects }) => {
    assertUniqueSlugs(posts);
    assertSeriesExist(posts, new Set(series.map((entry) => entry.slug)));
    assertFeaturedProjectLimit(projects);
    excludeDraftOnlyAssets([...posts, ...projects]);
  },
});
