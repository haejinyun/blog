import type { Post } from '@/lib/content';
import { PostDate } from './post-date';
import { TagList } from './tag-list';

interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: PostHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-8">
      <h1 className="text-heading-sm font-normal sm:text-heading">{post.title}</h1>
      <p className="text-muted-foreground sm:text-body">{post.description}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-caption tracking-caption text-muted-foreground">
        {/* 수정일(updated)은 화면에 보이지 않고 JSON-LD dateModified·sitemap 에만 쓴다 (2026-11-23 사용자 결정) */}
        <PostDate date={post.date} />
        <span aria-hidden="true">·</span>
        <span>{post.readingMinutes}분 읽기</span>
      </div>
      <TagList tags={post.tags} />
    </header>
  );
}
