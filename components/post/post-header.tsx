import type { Post } from '@/lib/content';
import { PostDate } from './post-date';
import { TagList } from './tag-list';

interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: PostHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-8">
      <h1 className="text-4xl leading-tight font-normal tracking-tight sm:text-heading">
        {post.title}
      </h1>
      <p className="text-muted-foreground sm:text-body">{post.description}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-caption tracking-caption text-muted-foreground">
        <PostDate date={post.date} />
        {post.updated && (
          <span>
            (수정 <PostDate date={post.updated} />)
          </span>
        )}
        <span aria-hidden="true">·</span>
        <span>{post.readingMinutes}분 읽기</span>
      </div>
      <TagList tags={post.tags} />
    </header>
  );
}
