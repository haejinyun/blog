import type { Metadata } from 'next';
import { siteConfig, toAbsoluteUrl } from '@/lib/config';
import { RSS_PATH, SITE_OG_IMAGE_PATH } from '@/lib/routes';
import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from '@/lib/seo/og-image';

/**
 * 페이지 metadata 생성 함수.
 * Next 는 segment 간 metadata 를 얕게(shallow) 병합하므로, 페이지가 openGraph·alternates 를
 * 지정하면 layout 의 값이 통째로 대체된다. 그래서 공통 값까지 매번 이 함수에서 함께 만든다.
 * 절대 URL 은 모두 toAbsoluteUrl(NEXT_PUBLIC_SITE_URL 기준)로 만든다.
 */

interface PageMetadataInput {
  title: string;
  description: string;
  /** 사이트 내부 경로 ('/blog/foo'). canonical 과 og:url 의 기준 */
  path: string;
}

interface ArticleMetadataInput extends PageMetadataInput {
  publishedTime: string;
  modifiedTime?: string;
  tags: string[];
  /** 글 OG 이미지 경로 ('/blog/foo/og.png') */
  imagePath: string;
}

function createAlternates(path: string): Metadata['alternates'] {
  return {
    canonical: toAbsoluteUrl(path),
    types: { 'application/rss+xml': toAbsoluteUrl(RSS_PATH) },
  };
}

function createOgImage(imagePath: string, alt: string) {
  return {
    url: toAbsoluteUrl(imagePath),
    type: OG_IMAGE_CONTENT_TYPE,
    ...OG_IMAGE_SIZE,
    alt,
  };
}

function createTwitter(title: string, description: string, imagePath: string, alt: string) {
  return {
    card: 'summary_large_image' as const,
    title,
    description,
    images: [createOgImage(imagePath, alt)],
  };
}

/** 일반 페이지 (목록, 태그, 시리즈 등). 사이트 기본 OG 이미지를 쓴다. */
export function createPageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: createAlternates(path),
    openGraph: {
      type: 'website',
      title,
      description,
      url: toAbsoluteUrl(path),
      siteName: siteConfig.title,
      locale: siteConfig.locale,
      images: [createOgImage(SITE_OG_IMAGE_PATH, siteConfig.title)],
    },
    twitter: createTwitter(title, description, SITE_OG_IMAGE_PATH, siteConfig.title),
  };
}

/** 사이트 홈. 제목 템플릿('%s | 사이트명')을 적용하지 않는다. */
export function createHomeMetadata(): Metadata {
  const page = createPageMetadata({
    title: siteConfig.title,
    description: siteConfig.description,
    path: '/',
  });
  return { ...page, title: { absolute: siteConfig.title } };
}

/** 글 상세. 글마다 빌드 시 생성한 OG 이미지를 쓴다. */
export function createArticleMetadata({
  title,
  description,
  path,
  publishedTime,
  modifiedTime,
  tags,
  imagePath,
}: ArticleMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: createAlternates(path),
    openGraph: {
      type: 'article',
      title,
      description,
      url: toAbsoluteUrl(path),
      siteName: siteConfig.title,
      locale: siteConfig.locale,
      publishedTime,
      modifiedTime: modifiedTime ?? publishedTime,
      authors: [siteConfig.author.name],
      tags,
      images: [createOgImage(imagePath, title)],
    },
    twitter: createTwitter(title, description, imagePath, title),
  };
}
