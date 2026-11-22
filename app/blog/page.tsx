import type { Metadata } from 'next';
import { PageHeading } from '@/components/layout/page-heading';
import { PostList } from '@/components/post/post-list';
import { PreviousBlogNotice } from '@/components/post/previous-blog-notice';
import { postRepository } from '@/lib/content';
import { createPageMetadata } from '@/lib/seo/metadata';

const description = '개발하며 배우고 고민한 것들을 기록합니다.';

export const metadata: Metadata = createPageMetadata({ title: 'Blog', description, path: '/blog' });

export default async function BlogPage() {
  const posts = await postRepository.getAllPosts();

  return (
    <>
      <PageHeading title="Blog" description={description} />
      <PostList posts={posts} />
      <PreviousBlogNotice />
    </>
  );
}
