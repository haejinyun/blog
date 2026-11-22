import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { siteConfig } from '../../lib/config';
import { draftPosts, publishedPosts } from '../support/built-content';
import {
  DEFAULT_OUT_DIR,
  extractCanonical,
  extractJsonLd,
  extractLinkedUrls,
  extractMetaProperty,
  extractSitemapLocations,
  listLinkFiles,
  listPageHtmlFiles,
  postHtmlPath,
  readOutputFile,
} from '../support/built-output';

/**
 * Phase 3 완료 조건 (기본 빌드 기준. 사이트 URL 을 바꾼 빌드는 site-url.spec.ts).
 * 테스트 프로세스와 빌드는 같은 NEXT_PUBLIC_SITE_URL 을 보므로 siteConfig.url 이 기대값이다.
 */

const SITE_URL = siteConfig.url;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

/** 사이트 주소 외에 결과물에 나와도 되는 주소: 표준 네임스페이스와 config 의 작성자 링크 */
const ALLOWED_EXTERNAL_ORIGINS = new Set([
  'https://schema.org',
  'http://www.sitemaps.org',
  'http://www.w3.org',
  new URL(siteConfig.author.github).origin,
]);

function postUrl(slug: string): string {
  return `${SITE_URL}/blog/${encodeURIComponent(slug)}`;
}

test.describe('글 상세 SEO', () => {
  for (const post of publishedPosts) {
    test(`${post.slug}: canonical, BlogPosting·BreadcrumbList JSON-LD, OG 이미지`, () => {
      const html = readOutputFile(DEFAULT_OUT_DIR, postHtmlPath(post.slug));

      expect(extractCanonical(html)).toBe(postUrl(post.slug));

      const jsonLd = extractJsonLd(html);
      const blogPosting = jsonLd.find((node) => node['@type'] === 'BlogPosting');
      expect(blogPosting).toMatchObject({
        headline: post.title,
        url: postUrl(post.slug),
        datePublished: post.date,
      });
      const breadcrumb = jsonLd.find((node) => node['@type'] === 'BreadcrumbList');
      expect(breadcrumb?.itemListElement).toHaveLength(3);

      const ogImage = extractMetaProperty(html, 'og:image');
      expect(ogImage).toBe(`${postUrl(post.slug)}/og.png`);
      expect(blogPosting?.image).toBe(ogImage);
    });

    test(`${post.slug}: OG 이미지가 빌드 시 PNG 로 생성된다`, () => {
      const file = join(DEFAULT_OUT_DIR, 'blog', post.slug, 'og.png');
      expect(existsSync(file)).toBe(true);
      expect(readFileSync(file).subarray(0, 4).equals(PNG_SIGNATURE)).toBe(true);
    });
  }
});

test('모든 페이지에 canonical 과 og:image 가 있다', () => {
  const pages = listPageHtmlFiles(DEFAULT_OUT_DIR);
  expect(pages.length).toBeGreaterThan(publishedPosts.length);

  // 홈 canonical 은 trailingSlash: false 라서 Next 가 끝의 '/' 를 뗀다 ('http://host')
  const siteUrlPattern = new RegExp(`^${SITE_URL}(/|$)`);
  for (const page of pages) {
    const html = readFileSync(page, 'utf-8');
    expect(extractCanonical(html), page).toMatch(siteUrlPattern);
    expect(extractMetaProperty(html, 'og:image'), page).toMatch(siteUrlPattern);
  }
});

test('홈에 Person JSON-LD 가 있다', () => {
  const html = readOutputFile(DEFAULT_OUT_DIR, 'index.html');
  const person = extractJsonLd(html).find((node) => node['@type'] === 'Person');
  expect(person).toMatchObject({ name: siteConfig.author.name, url: `${SITE_URL}/` });
});

test('sitemap 에 모든 공개 글이 있고 draft 글은 없다', () => {
  const locations = extractSitemapLocations(readOutputFile(DEFAULT_OUT_DIR, 'sitemap.xml'));

  for (const post of publishedPosts) {
    expect(locations).toContain(postUrl(post.slug));
  }
  for (const draft of draftPosts) {
    expect(locations).not.toContain(postUrl(draft.slug));
  }
});

test('robots.txt 가 sitemap 위치를 알려준다', () => {
  const robots = readOutputFile(DEFAULT_OUT_DIR, 'robots.txt');
  expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
});

test('RSS 에 모든 공개 글이 최신순으로 있다', () => {
  const rss = readOutputFile(DEFAULT_OUT_DIR, 'rss.xml');
  const links = [...rss.matchAll(/<item>.*?<link>([^<]+)<\/link>/g)].map((match) => match[1]);
  expect(links).toEqual(publishedPosts.map((post) => postUrl(post.slug)));
});

test('빌드 결과물에 사이트 주소 외의 하드코딩된 도메인이 없다', () => {
  const unexpected = listLinkFiles(DEFAULT_OUT_DIR).flatMap((file) =>
    extractLinkedUrls(file, readFileSync(file, 'utf-8'))
      .map((url) => new URL(url).origin)
      .filter((origin) => origin !== SITE_URL && !ALLOWED_EXTERNAL_ORIGINS.has(origin))
      .map((origin) => `${file}: ${origin}`),
  );
  expect(unexpected).toEqual([]);
});
