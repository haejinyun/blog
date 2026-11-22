import { siteConfig, toAbsoluteUrl } from '@/lib/config';
import type { PostMeta } from '@/lib/content';
import { postPath } from '@/lib/routes';

/**
 * schema.org JSON-LD 생성 함수. 절대 URL 은 모두 toAbsoluteUrl(NEXT_PUBLIC_SITE_URL 기준)로 만든다.
 */

export type JsonLd = { '@context': 'https://schema.org'; '@type': string } & Record<
  string,
  unknown
>;

export interface BreadcrumbItem {
  name: string;
  path: string;
}

function createPersonNode() {
  return {
    '@type': 'Person',
    name: siteConfig.author.name,
    url: toAbsoluteUrl('/'),
    email: `mailto:${siteConfig.author.email}`,
    sameAs: [siteConfig.author.github],
  };
}

export function createPersonJsonLd(): JsonLd {
  return { '@context': 'https://schema.org', ...createPersonNode() };
}

export function createBlogPostingJsonLd(post: PostMeta, imagePath: string): JsonLd {
  const url = toAbsoluteUrl(postPath(post.slug));
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    image: toAbsoluteUrl(imagePath),
    keywords: post.tags,
    inLanguage: siteConfig.language,
    author: createPersonNode(),
  };
}

export function createBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}

/**
 * <script> 안에 넣을 JSON 문자열. '<' 를 이스케이프해서 본문 값에 '</script>' 가 있어도
 * 태그가 닫히지 않게 한다 (Next.js JSON-LD 가이드 권장 방식).
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
