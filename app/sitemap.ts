import type { MetadataRoute } from 'next';
import { toAbsoluteUrl } from '@/lib/config';
import { type PostMeta, postRepository, projectRepository, seriesRepository } from '@/lib/content';
import { postPath, projectPath, seriesPath, tagPath } from '@/lib/routes';

export const dynamic = 'force-static';

const STATIC_PATHS = ['/', '/blog', '/series', '/projects', '/about'];

function toPostEntry(post: PostMeta): MetadataRoute.Sitemap[number] {
  return {
    url: toAbsoluteUrl(postPath(post.slug)),
    lastModified: post.updated ?? post.date,
  };
}

/** 공개 글이 하나 이상 있는 시리즈 (빈 시리즈 페이지는 검색엔진에 알리지 않는다) */
async function getPublishedSeriesSlugs(): Promise<string[]> {
  const allSeries = await seriesRepository.getAllSeries();
  const postCounts = await Promise.all(
    allSeries.map(async (series) => (await postRepository.getPostsBySeries(series.slug)).length),
  );
  return allSeries.filter((_, index) => (postCounts[index] ?? 0) > 0).map((series) => series.slug);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tags, seriesSlugs, projects] = await Promise.all([
    postRepository.getAllPosts(),
    postRepository.getAllTags(),
    getPublishedSeriesSlugs(),
    projectRepository.getAllProjects(),
  ]);

  return [
    ...STATIC_PATHS.map((path) => ({ url: toAbsoluteUrl(path) })),
    ...posts.map(toPostEntry),
    ...seriesSlugs.map((slug) => ({ url: toAbsoluteUrl(seriesPath(slug)) })),
    ...tags.map(({ tag }) => ({ url: toAbsoluteUrl(tagPath(tag)) })),
    ...projects.map((project) => ({ url: toAbsoluteUrl(projectPath(project.slug)) })),
  ];
}
