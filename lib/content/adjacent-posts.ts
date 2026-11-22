import type { PostMeta } from './types';

export interface AdjacentPosts {
  previous: PostMeta | null;
  next: PostMeta | null;
}

/** 순서대로 정렬된 글 목록에서 slug 의 이전/다음 글을 찾는다. */
export function findAdjacentPosts(orderedPosts: PostMeta[], slug: string): AdjacentPosts {
  const index = orderedPosts.findIndex((post) => post.slug === slug);
  if (index === -1) return { previous: null, next: null };

  return {
    previous: orderedPosts[index - 1] ?? null,
    next: orderedPosts[index + 1] ?? null,
  };
}
