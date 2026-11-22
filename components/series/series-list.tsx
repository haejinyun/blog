import Link from 'next/link';
import { PostDate } from '@/components/post/post-date';
import type { Series } from '@/lib/content';
import { seriesPath } from '@/lib/routes';

export interface SeriesSummary {
  series: Series;
  postCount: number;
  lastUpdated: string; // 시리즈 글 중 가장 최근 작성·수정일 (ISO 8601)
}

interface SeriesListProps {
  items: SeriesSummary[];
}

export function SeriesList({ items }: SeriesListProps) {
  if (items.length === 0) {
    return <p className="py-6 text-muted-foreground">아직 공개된 시리즈가 없습니다.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => (
        <li key={item.series.slug}>
          <SeriesListItem {...item} />
        </li>
      ))}
    </ul>
  );
}

function SeriesListItem({ series, postCount, lastUpdated }: SeriesSummary) {
  return (
    <article className="group flex flex-col gap-2 py-6">
      <h2 className="text-body font-normal">
        <Link href={seriesPath(series.slug)} className="underline-offset-4 group-hover:underline">
          {series.title}
        </Link>
      </h2>
      <p className="text-muted-foreground">{series.description}</p>
      <p className="flex items-center gap-2 text-caption tracking-caption text-muted-foreground">
        <span>글 {postCount}개</span>
        <span aria-hidden="true">·</span>
        <span>
          마지막 업데이트 <PostDate date={lastUpdated} />
        </span>
      </p>
    </article>
  );
}
