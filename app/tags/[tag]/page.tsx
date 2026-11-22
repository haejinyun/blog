import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeading } from '@/components/layout/page-heading';
import { PostList } from '@/components/post/post-list';
import { postRepository } from '@/lib/content';
import { decodeParam, toStaticParams } from '@/lib/route-params';
import { tagPath } from '@/lib/routes';
import { createPageMetadata } from '@/lib/seo/metadata';

export const dynamicParams = false;

export async function generateStaticParams() {
  const tags = await postRepository.getAllTags();
  return toStaticParams(
    'tag',
    tags.map(({ tag }) => tag),
  );
}

async function getTagFromParams(params: PageProps<'/tags/[tag]'>['params']): Promise<string> {
  const { tag } = await params;
  return decodeParam(tag);
}

export async function generateMetadata({ params }: PageProps<'/tags/[tag]'>): Promise<Metadata> {
  const tag = await getTagFromParams(params);
  return createPageMetadata({
    title: `#${tag}`,
    description: `"${tag}" 태그가 달린 글 목록`,
    path: tagPath(tag),
  });
}

export default async function TagPage({ params }: PageProps<'/tags/[tag]'>) {
  const tag = await getTagFromParams(params);
  const posts = await postRepository.getPostsByTag(tag);
  if (posts.length === 0) notFound();

  return (
    <>
      <PageHeading title={`#${tag}`} description={`${posts.length}개의 글`} />
      <PostList posts={posts} />
    </>
  );
}
