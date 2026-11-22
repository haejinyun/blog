import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleWithToc } from '@/components/mdx/article-with-toc';
import { PostCoverImage } from '@/components/post/post-cover-image';
import { PostHeader } from '@/components/post/post-header';
import { ScrollToTopButton } from '@/components/post/scroll-to-top-button';
import { JsonLdScript } from '@/components/seo/json-ld-script';
import { SeriesBadge, SeriesNavigation } from '@/components/series/series-navigation';
import { findAdjacentPosts, type Post, postRepository, seriesRepository } from '@/lib/content';
import { decodeParam, toStaticParams } from '@/lib/route-params';
import { postOgImagePath, postPath } from '@/lib/routes';
import { createBlogPostingJsonLd, createBreadcrumbJsonLd } from '@/lib/seo/json-ld';
import { createArticleMetadata } from '@/lib/seo/metadata';

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await postRepository.getAllPosts();
  return toStaticParams(
    'slug',
    posts.map((post) => post.slug),
  );
}

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const post = await getPostFromParams(params);
  if (!post) return {};

  return createArticleMetadata({
    title: post.title,
    description: post.description,
    path: postPath(post.slug),
    publishedTime: post.date,
    modifiedTime: post.updated,
    tags: post.tags,
    imagePath: postOgImagePath(post.slug),
  });
}

async function getPostFromParams(params: PageProps<'/blog/[slug]'>['params']) {
  const { slug } = await params;
  return postRepository.getPostBySlug(decodeParam(slug));
}

async function getSeriesNavigationProps(post: Post) {
  if (!post.series) return null;
  const series = await seriesRepository.getSeriesBySlug(post.series);
  if (!series) return null;

  const seriesPosts = await postRepository.getPostsBySeries(series.slug);
  return {
    series,
    currentOrder: seriesPosts.findIndex((entry) => entry.slug === post.slug) + 1,
    totalCount: seriesPosts.length,
    adjacent: findAdjacentPosts(seriesPosts, post.slug),
  };
}

export default async function PostPage({ params }: PageProps<'/blog/[slug]'>) {
  const post = await getPostFromParams(params);
  if (!post) notFound();

  const seriesNavigation = await getSeriesNavigationProps(post);

  return (
    <article className="flex flex-col gap-10">
      <JsonLdScript data={createBlogPostingJsonLd(post, postOgImagePath(post.slug))} />
      <JsonLdScript
        data={createBreadcrumbJsonLd([
          { name: '홈', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: postPath(post.slug) },
        ])}
      />
      <PostHeader post={post} />
      {post.thumbnail && <PostCoverImage src={post.thumbnail} />}
      {seriesNavigation && <SeriesBadge {...seriesNavigation} />}
      <ArticleWithToc code={post.body} toc={post.toc} />
      {seriesNavigation && <SeriesNavigation {...seriesNavigation} />}
      <ScrollToTopButton />
    </article>
  );
}
