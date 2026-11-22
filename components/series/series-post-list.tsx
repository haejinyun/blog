import Link from 'next/link';
import { PostDate } from '@/components/post/post-date';
import type { PostMeta } from '@/lib/content';
import { postPath } from '@/lib/routes';

interface SeriesPostListProps {
  posts: PostMeta[];
}

export function SeriesPostList({ posts }: SeriesPostListProps) {
  if (posts.length === 0) {
    return <p className="text-muted-foreground">아직 이 시리즈에 공개된 글이 없습니다.</p>;
  }

  return (
    <ol className="flex flex-col divide-y divide-border">
      {posts.map((post, index) => (
        <li key={post.slug} className="flex gap-4 py-5">
          <span className="w-6 shrink-0 text-body text-muted-foreground">{index + 1}</span>
          <div className="flex flex-col gap-1">
            <Link
              href={postPath(post.slug)}
              className="text-body hover:underline underline-offset-4"
            >
              {post.title}
            </Link>
            <p className="text-muted-foreground">{post.description}</p>
            <span className="text-caption tracking-caption text-muted-foreground">
              <PostDate date={post.date} />
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
