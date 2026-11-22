import type { PostMeta } from '@/lib/content';
import { PostListItem } from './post-list-item';

interface PostListProps {
  posts: PostMeta[];
  headingLevel?: 'h2' | 'h3';
}

export function PostList({ posts, headingLevel }: PostListProps) {
  if (posts.length === 0) {
    return <p className="py-6 text-muted-foreground">아직 작성된 글이 없습니다.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {posts.map((post) => (
        <li key={post.slug}>
          <PostListItem post={post} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
