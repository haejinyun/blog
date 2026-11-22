import { postRepository } from '@/lib/content';
import { formatDate } from '@/lib/format-date';
import { decodeParam, toStaticParams } from '@/lib/route-params';
import { renderOgImage } from '@/lib/seo/og-image';

/**
 * 글별 OG 이미지. 빌드 시 out/blog/<slug>/og.png 로 생성한다 (요청 시점 생성 금지).
 * opengraph-image 파일 규칙은 확장자 없는 파일을 만들어 정적 호스팅에서 Content-Type 이 빠지기 때문에
 * .png 경로의 route handler 로 만든다.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await postRepository.getAllPosts();
  return toStaticParams(
    'slug',
    posts.map((post) => post.slug),
  );
}

export async function GET(_request: Request, { params }: RouteContext<'/blog/[slug]/og.png'>) {
  const { slug } = await params;
  const post = await postRepository.getPostBySlug(decodeParam(slug));
  if (!post) return new Response('Not Found', { status: 404 });

  return renderOgImage({ title: post.title, eyebrow: formatDate(post.date) });
}
