import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 테스트 기대값을 샘플 글에 하드코딩하지 않기 위해, 빌드된 콘텐츠 데이터에서 기대값을 계산한다.
 * (test 스크립트가 `pnpm build` 를 먼저 실행하므로 테스트 시점에 항상 존재한다.)
 */
interface TocEntry {
  title: string;
  url: string;
  items: TocEntry[];
}

interface BuiltPost {
  slug: string;
  title: string;
  date: string;
  draft: boolean;
  tags: string[];
  series?: string;
  seriesOrder?: number;
  toc: TocEntry[];
  body: string;
  thumbnail?: string;
  previewImage?: string;
}

interface BuiltSeries {
  slug: string;
  title: string;
  description: string;
}

function readBuiltJson<T>(name: string): T {
  const file = join(process.cwd(), '.velite', `${name}.json`);
  return JSON.parse(readFileSync(file, 'utf-8')) as T;
}

const builtPosts = readBuiltJson<BuiltPost[]>('posts');

export const publishedPosts = builtPosts
  .filter((post) => !post.draft)
  .sort((a, b) => b.date.localeCompare(a.date));

export const draftPosts = builtPosts.filter((post) => post.draft);

export const postsWithImage = publishedPosts.filter((post) => post.body.includes('/static/'));

export const postsWithToc = publishedPosts.filter((post) => post.toc.length > 0);

export const postsWithThumbnail = publishedPosts.filter((post) => post.thumbnail);

export const allSeries = readBuiltJson<BuiltSeries[]>('series');

/** 시리즈에 속한 공개 글을 seriesOrder 오름차순으로 반환한다. */
export function getSeriesPosts(seriesSlug: string): BuiltPost[] {
  return publishedPosts
    .filter((post) => post.series === seriesSlug)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
}

export const publishedTags = [...new Set(publishedPosts.flatMap((post) => post.tags))];

/** 공개 글이 하나도 없는 태그 (draft 에만 달린 태그) */
export const draftOnlyTags = [...new Set(draftPosts.flatMap((post) => post.tags))].filter(
  (tag) => !publishedTags.includes(tag),
);

export function getPostsByTag(tag: string): BuiltPost[] {
  return publishedPosts.filter((post) => post.tags.includes(tag));
}

/** 본문이 참조하는 에셋 파일명 ('/static/a-1234.png' → 'a-1234.png') */
export function collectAssetNames(post: BuiltPost): string[] {
  return [...post.body.matchAll(/\/static\/([^"'\s)]+)/g)].map((match) => match[1] ?? '');
}

export function flattenToc(entries: TocEntry[]): TocEntry[] {
  return entries.flatMap((entry) => [entry, ...flattenToc(entry.items)]);
}

interface BuiltProject {
  slug: string;
  title: string;
  startDate: string;
  featured: boolean;
  featuredOrder?: number;
  draft: boolean;
}

const builtProjects = readBuiltJson<BuiltProject[]>('projects');

export const publishedProjects = builtProjects
  .filter((project) => !project.draft)
  .sort((a, b) => b.startDate.localeCompare(a.startDate));

export const draftProjects = builtProjects.filter((project) => project.draft);

export const featuredProjects = publishedProjects
  .filter((project) => project.featured)
  .sort(
    (a, b) =>
      (a.featuredOrder ?? Number.POSITIVE_INFINITY) - (b.featuredOrder ?? Number.POSITIVE_INFINITY),
  );

interface BuiltAbout {
  title: string;
  resumePdf?: string;
}

export const builtAbout = readBuiltJson<BuiltAbout>('about');
