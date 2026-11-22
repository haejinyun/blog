import { expect, test } from '@playwright/test';
import { publishedPosts } from '../support/built-content';

/** preview 서버가 실제로 내려주는 SEO 파일 (Content-Type, XML 유효성) */

test('RSS 가 유효한 XML 이고 공개 글 수만큼 item 이 있다', async ({ page, request }) => {
  const response = await request.get('/rss.xml');
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('xml');
  const xml = await response.text();

  // 브라우저의 XML 파서로 검증한다. 형식이 잘못되면 <parsererror> 문서가 만들어진다.
  const result = await page.evaluate((source) => {
    const document = new DOMParser().parseFromString(source, 'application/xml');
    return {
      parseError: document.querySelector('parsererror')?.textContent ?? null,
      rootName: document.documentElement.nodeName,
      version: document.documentElement.getAttribute('version'),
      itemCount: document.querySelectorAll('channel > item').length,
    };
  }, xml);

  expect(result.parseError).toBeNull();
  expect(result.rootName).toBe('rss');
  expect(result.version).toBe('2.0');
  expect(result.itemCount).toBe(publishedPosts.length);
});

test('sitemap.xml 이 유효한 XML 이다', async ({ page, request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  const parseError = await page.evaluate(
    (source) =>
      new DOMParser().parseFromString(source, 'application/xml').querySelector('parsererror')
        ?.textContent ?? null,
    xml,
  );
  expect(parseError).toBeNull();
});

test('OG 이미지가 image/png 로 제공된다', async ({ request }) => {
  const paths = [
    '/og.png',
    ...publishedPosts.map((post) => `/blog/${encodeURIComponent(post.slug)}/og.png`),
  ];
  for (const path of paths) {
    const response = await request.get(path);
    expect(response.ok(), path).toBe(true);
    expect(response.headers()['content-type'], path).toBe('image/png');
  }
});

test('파비콘과 앱 아이콘이 head 에 연결되고 이미지로 제공된다', async ({ page, request }) => {
  await page.goto('/');
  const iconLinks = page.locator('link[rel="icon"], link[rel="apple-touch-icon"]');
  await expect(iconLinks).toHaveCount(3);

  for (const href of await iconLinks.evaluateAll((links) =>
    links.map((link) => link.getAttribute('href') ?? ''),
  )) {
    const response = await request.get(href);
    expect(response.ok(), href).toBe(true);
    expect(response.headers()['content-type'], href).toMatch(/^image\//);
  }
});
