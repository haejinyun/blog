import type { Post as VelitePost } from '#site/content';
import type { Post, PostMeta, PostRepository } from './types';

/**
 * Velite 가 빌드 시 content/ 폴더(파일 시스템)를 읽어 만든 데이터를 PostRepository 로 제공한다.
 * 페이지는 이 구현체를 직접 쓰지 않고 lib/content 의 postRepository 를 통해 접근한다.
 */
export function createVelitePostRepository(source: VelitePost[]): PostRepository {
  const publishedPosts = source.filter(isPublished).sort(compareByDateDesc);

  return {
    async getAllPosts() {
      return publishedPosts.map(toPostMeta);
    },

    async getPostBySlug(slug) {
      const found = publishedPosts.find((post) => post.slug === slug);
      if (!found) return null;
      return toPost(found);
    },

    async getPostsByTag(tag) {
      return publishedPosts.filter((post) => post.tags.includes(tag)).map(toPostMeta);
    },

    async getPostsBySeries(series) {
      return publishedPosts
        .filter((post) => post.series === series)
        .sort(compareBySeriesOrderAsc)
        .map(toPostMeta);
    },

    async getAllTags() {
      const countByTag = new Map<string, number>();
      for (const tag of publishedPosts.flatMap((post) => post.tags)) {
        countByTag.set(tag, (countByTag.get(tag) ?? 0) + 1);
      }
      return [...countByTag]
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
    },
  };
}

function isPublished(post: VelitePost): boolean {
  return !post.draft;
}

function compareByDateDesc(a: VelitePost, b: VelitePost): number {
  return b.date.localeCompare(a.date);
}

function compareBySeriesOrderAsc(a: VelitePost, b: VelitePost): number {
  return (a.seriesOrder ?? Number.MAX_SAFE_INTEGER) - (b.seriesOrder ?? Number.MAX_SAFE_INTEGER);
}

function toPostMeta(post: VelitePost): PostMeta {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    updated: post.updated,
    tags: post.tags,
    series: post.series,
    seriesOrder: post.seriesOrder,
    thumbnail: post.thumbnail,
    previewImage: post.previewImage,
    draft: post.draft,
  };
}

function toPost(post: VelitePost): Post {
  return {
    ...toPostMeta(post),
    body: post.body,
    readingMinutes: post.readingMinutes,
    toc: post.toc,
  };
}
