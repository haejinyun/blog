import type { Route } from 'next';

/**
 * 사이트 내부 경로 생성 함수. 링크, canonical, sitemap, RSS 가 같은 경로를 쓰도록 한곳에 모은다.
 * 경로 조각은 인코딩해서 '#', '?', 공백 같은 문자가 들어가도 URL 이 깨지지 않게 한다.
 */

export const RSS_PATH = '/rss.xml';

export function postPath(slug: string): Route {
  return `/blog/${encodeURIComponent(slug)}` as Route;
}

export function tagPath(tag: string): Route {
  return `/tags/${encodeURIComponent(tag)}` as Route;
}

export function seriesPath(slug: string): Route {
  return `/series/${encodeURIComponent(slug)}` as Route;
}

/** 사이트 기본 OG 이미지 (app/og.png/route.tsx 가 빌드 시 생성) */
export const SITE_OG_IMAGE_PATH = '/og.png';

/** 글 OG 이미지 (app/blog/[slug]/og.png/route.tsx 가 빌드 시 생성) */
export function postOgImagePath(slug: string): string {
  return `${postPath(slug)}/og.png`;
}

export function projectPath(slug: string): Route {
  return `/projects/${encodeURIComponent(slug)}` as Route;
}
