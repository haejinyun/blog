import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeading } from '@/components/layout/page-heading';
import { MdxArticle } from '@/components/mdx/mdx-article';
import { SeriesPostList } from '@/components/series/series-post-list';
import { postRepository, seriesRepository } from '@/lib/content';
import { decodeParam, toStaticParams } from '@/lib/route-params';
import { seriesPath } from '@/lib/routes';
import { createPageMetadata } from '@/lib/seo/metadata';

export const dynamicParams = false;

export async function generateStaticParams() {
  const allSeries = await seriesRepository.getAllSeries();
  return toStaticParams(
    'slug',
    allSeries.map((series) => series.slug),
  );
}

async function getSeriesFromParams(params: PageProps<'/series/[slug]'>['params']) {
  const { slug } = await params;
  return seriesRepository.getSeriesBySlug(decodeParam(slug));
}

export async function generateMetadata({ params }: PageProps<'/series/[slug]'>): Promise<Metadata> {
  const series = await getSeriesFromParams(params);
  if (!series) return {};

  return createPageMetadata({
    title: series.title,
    description: series.description,
    path: seriesPath(series.slug),
  });
}

export default async function SeriesPage({ params }: PageProps<'/series/[slug]'>) {
  const series = await getSeriesFromParams(params);
  if (!series) notFound();

  const posts = await postRepository.getPostsBySeries(series.slug);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6 border-b border-border pb-8">
        <PageHeading title={series.title} description={series.description} />
        <MdxArticle code={series.body} />
      </div>
      <section aria-labelledby="series-posts-heading" className="flex flex-col gap-2">
        <h2 id="series-posts-heading" className="text-body font-normal">
          이 시리즈의 글 ({posts.length})
        </h2>
        <SeriesPostList posts={posts} />
      </section>
    </div>
  );
}
