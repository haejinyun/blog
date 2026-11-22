import Link from 'next/link';
import type { PostMeta } from '@/lib/content';
import { postPath } from '@/lib/routes';
import { PostDate } from './post-date';
import { TagList } from './tag-list';

interface PostListItemProps {
  post: PostMeta;
  /** 목록이 섹션 안에 들어가면(홈 등) 'h3' */
  headingLevel?: 'h2' | 'h3';
}

export function PostListItem({ post, headingLevel: Heading = 'h2' }: PostListItemProps) {
  return (
    <article className="group flex items-start gap-5 py-6">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Heading className="text-body font-normal">
          <Link href={postPath(post.slug)} className="underline-offset-4 group-hover:underline">
            {post.title}
          </Link>
        </Heading>
        <p className="text-muted-foreground">{post.description}</p>
        <div className="flex flex-wrap items-center gap-3 text-caption tracking-caption text-muted-foreground">
          <PostDate date={post.date} />
          <TagList tags={post.tags} />
        </div>
      </div>
      {post.previewImage && <PostPreviewImage src={post.previewImage} />}
    </article>
  );
}

/** 목록 미리보기 이미지. 제목 링크가 같은 글을 가리키므로 장식용(alt="")으로 둔다. */
function PostPreviewImage({ src }: { src: string }) {
  return (
    // biome-ignore lint/performance/noImgElement: 정적 export 라 next/image 최적화를 쓰지 않는다
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      className="aspect-video w-28 shrink-0 rounded-sm object-cover sm:w-44"
    />
  );
}
