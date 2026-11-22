import Link from 'next/link';
import type { AdjacentPosts, Series } from '@/lib/content';
import { postPath, seriesPath } from '@/lib/routes';

export interface SeriesPosition {
  series: Series;
  currentOrder: number;
  totalCount: number;
}

/** 글 상단: 이 글이 어느 시리즈의 몇 번째 글인지 보여준다. */
export function SeriesBadge({ series, currentOrder, totalCount }: SeriesPosition) {
  return (
    <p className="rounded-sm border border-border bg-surface px-card py-element text-muted-foreground">
      시리즈 ·{' '}
      <Link
        href={seriesPath(series.slug)}
        className="text-foreground underline-offset-4 hover:underline"
      >
        {series.title}
      </Link>{' '}
      ({currentOrder}/{totalCount})
    </p>
  );
}

interface SeriesNavigationProps extends SeriesPosition {
  adjacent: AdjacentPosts;
}

/** 글 하단: 같은 시리즈의 이전/다음 편으로 이동한다. */
export function SeriesNavigation({ adjacent, ...position }: SeriesNavigationProps) {
  return (
    <nav aria-label="시리즈 이전/다음 편" className="flex flex-col gap-4">
      <SeriesBadge {...position} />
      <div className="grid gap-3 sm:grid-cols-2">
        <AdjacentLink direction="previous" post={adjacent.previous} />
        <AdjacentLink direction="next" post={adjacent.next} />
      </div>
    </nav>
  );
}

interface AdjacentLinkProps {
  direction: 'previous' | 'next';
  post: AdjacentPosts['previous'];
}

const directionLabel = { previous: '← 이전 편', next: '다음 편 →' } as const;

function AdjacentLink({ direction, post }: AdjacentLinkProps) {
  if (!post) return null;
  const alignment = direction === 'next' ? 'sm:col-start-2 sm:text-right' : '';

  return (
    <Link
      href={postPath(post.slug)}
      rel={direction === 'previous' ? 'prev' : 'next'}
      className={`flex flex-col gap-1 rounded-sm border border-border bg-surface p-card hover:underline underline-offset-4 ${alignment}`}
    >
      <span className="text-caption tracking-caption text-muted-foreground">
        {directionLabel[direction]}
      </span>
      <span className="text-foreground">{post.title}</span>
    </Link>
  );
}
