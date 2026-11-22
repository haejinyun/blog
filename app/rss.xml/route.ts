import { postRepository } from '@/lib/content';
import { buildRssFeed } from '@/lib/seo/rss';

export const dynamic = 'force-static';

export async function GET() {
  const posts = await postRepository.getAllPosts();
  return new Response(buildRssFeed(posts), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
