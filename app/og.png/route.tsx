import { siteConfig } from '@/lib/config';
import { renderOgImage } from '@/lib/seo/og-image';

/** 글 이외 페이지에서 쓰는 사이트 기본 OG 이미지. 빌드 시 out/og.png 로 생성한다. */
export const dynamic = 'force-static';

export function GET() {
  return renderOgImage({ title: siteConfig.title, description: siteConfig.description });
}
