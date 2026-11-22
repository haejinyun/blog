import type { Metadata } from 'next';
import { PageHeading } from '@/components/layout/page-heading';
import { SeriesList, type SeriesSummary } from '@/components/series/series-list';
import { type PostMeta, postRepository, type Series, seriesRepository } from '@/lib/content';
import { createPageMetadata } from '@/lib/seo/metadata';

const description = '주제별로 이어지는 글 묶음입니다.';

export const metadata: Metadata = createPageMetadata({
  title: 'Series',
  description,
  path: '/series',
});

/** 글들의 작성·수정일 중 가장 최근 날짜 (ISO 8601 문자열은 사전순 = 시간순) */
function findLatestDate(posts: PostMeta[]): string {
  const dates = posts.map((post) => post.updated ?? post.date).sort();
  return dates.at(-1) ?? '';
}

async function toSeriesSummary(series: Series): Promise<SeriesSummary | null> {
  const posts = await postRepository.getPostsBySeries(series.slug);
  if (posts.length === 0) return null;

  return { series, postCount: posts.length, lastUpdated: findLatestDate(posts) };
}

/** 공개 글이 있는 시리즈만, 최근 업데이트순으로 */
async function getSeriesSummaries(): Promise<SeriesSummary[]> {
  const allSeries = await seriesRepository.getAllSeries();
  const summaries = await Promise.all(allSeries.map(toSeriesSummary));
  return summaries
    .filter((summary) => summary !== null)
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
}

export default async function SeriesIndexPage() {
  const summaries = await getSeriesSummaries();

  return (
    <>
      <PageHeading title="Series" description={description} />
      <SeriesList items={summaries} />
    </>
  );
}
