import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { publishedPosts } from '../support/built-content';
import {
  extractCanonical,
  extractJsonLd,
  extractLinkedUrls,
  extractMetaProperty,
  extractSitemapLocations,
  listLinkFiles,
  postHtmlPath,
  readOutputFile,
} from '../support/built-output';

/**
 * Phase 3 완료 조건: NEXT_PUBLIC_SITE_URL 을 바꿔 빌드하면 canonical, sitemap, RSS 의 URL 이 모두 따라 바뀐다.
 * e2e 가 쓰는 out/ 을 건드리지 않도록 EXPORT_OUT_DIR 로 다른 폴더에 export 한다 (next.config.ts 참고).
 * 콘텐츠(.velite)는 test 스크립트의 빌드가 이미 만들어 두었으므로 next build 만 다시 실행한다.
 */

const CHECK_SITE_URL = 'https://site-url-check.example';
const EXPORT_DIR_NAME = 'tests/.tmp/site-url-export';
const EXPORT_DIR = join(process.cwd(), EXPORT_DIR_NAME);

test.describe('사이트 URL 환경변수', () => {
  // serial: 병렬 워커마다 beforeAll 이 돌면 빌드가 동시에 여러 번 실행된다.
  test.describe.configure({ mode: 'serial', timeout: 240_000 });

  test.beforeAll(() => {
    rmSync(EXPORT_DIR, { recursive: true, force: true });
    execFileSync('pnpm', ['exec', 'next', 'build'], {
      env: {
        ...process.env,
        NEXT_PUBLIC_SITE_URL: CHECK_SITE_URL,
        EXPORT_OUT_DIR: EXPORT_DIR_NAME,
      },
      stdio: 'pipe',
    });
  });

  test.afterAll(() => {
    rmSync(EXPORT_DIR, { recursive: true, force: true });
  });

  test('canonical, og:url, og:image, JSON-LD 가 바뀐 주소를 쓴다', () => {
    for (const post of publishedPosts) {
      const html = readOutputFile(EXPORT_DIR, postHtmlPath(post.slug));
      const expectedUrl = `${CHECK_SITE_URL}/blog/${encodeURIComponent(post.slug)}`;

      expect(extractCanonical(html)).toBe(expectedUrl);
      expect(extractMetaProperty(html, 'og:url')).toBe(expectedUrl);
      expect(extractMetaProperty(html, 'og:image')).toBe(`${expectedUrl}/og.png`);
      const blogPosting = extractJsonLd(html).find((node) => node['@type'] === 'BlogPosting');
      expect(blogPosting?.url).toBe(expectedUrl);
    }
  });

  test('sitemap, robots, RSS 가 바뀐 주소를 쓴다', () => {
    const locations = extractSitemapLocations(readOutputFile(EXPORT_DIR, 'sitemap.xml'));
    expect(locations.length).toBeGreaterThan(0);
    for (const location of locations) {
      expect(location.startsWith(`${CHECK_SITE_URL}/`)).toBe(true);
    }

    expect(readOutputFile(EXPORT_DIR, 'robots.txt')).toContain(
      `Sitemap: ${CHECK_SITE_URL}/sitemap.xml`,
    );

    const rss = readOutputFile(EXPORT_DIR, 'rss.xml');
    const links = [...rss.matchAll(/<link>([^<]+)<\/link>/g)].map((match) => match[1] ?? '');
    expect(links.length).toBe(publishedPosts.length + 1); // 채널 링크 + 글 링크
    for (const link of links) {
      expect(link.startsWith(`${CHECK_SITE_URL}/`)).toBe(true);
    }
  });

  test('결과물의 어떤 링크도 기본 주소(localhost)를 가리키지 않는다', () => {
    const leftovers = listLinkFiles(EXPORT_DIR).flatMap((file) =>
      extractLinkedUrls(file, readFileSync(file, 'utf-8'))
        .filter((url) => new URL(url).hostname === 'localhost')
        .map((url) => `${file}: ${url}`),
    );
    expect(leftovers).toEqual([]);
  });
});
