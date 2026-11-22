import { expect, test } from '@playwright/test';
import { flattenToc, postsWithToc } from '../support/built-content';

test.describe('글 상세 목차(TOC)', () => {
  for (const post of postsWithToc) {
    test(`"${post.slug}" 목차가 모든 소제목을 가리킨다`, async ({ page }) => {
      await page.goto(`/blog/${post.slug}`);
      const toc = page.getByRole('navigation', { name: '목차' });
      const entries = flattenToc(post.toc);

      await expect(toc.getByRole('link')).toHaveText(entries.map((entry) => entry.title));

      for (const entry of entries) {
        const id = decodeURIComponent(entry.url.slice(1));
        await expect(page.locator(`[id="${id}"]`)).toHaveText(entry.title);
      }
    });
  }

  test('목차 항목을 누르면 해당 소제목으로 이동한다', async ({ page }) => {
    const post = postsWithToc[0];
    test.skip(!post, '목차가 있는 글이 없음');
    if (!post) return;

    const last = flattenToc(post.toc).at(-1);
    if (!last) return;

    await page.goto(`/blog/${post.slug}`);
    await page
      .getByRole('navigation', { name: '목차' })
      .getByRole('link', { name: last.title })
      .click();

    await expect(page).toHaveURL(new RegExp(`${encodeURIComponent(last.url.slice(1))}$`));
    await expect(page.locator(`[id="${last.url.slice(1)}"]`)).toBeInViewport();
  });

  test('스크롤하면 지금 읽는 섹션의 목차 항목이 강조된다', async ({ page }) => {
    const post = postsWithToc.find((entry) => flattenToc(entry.toc).length >= 3);
    test.skip(!post, '소제목이 3개 이상인 글이 없음');
    if (!post) return;

    const entries = flattenToc(post.toc);
    const target = entries[1];
    if (!target) return;

    await page.goto(`/blog/${post.slug}`);
    const toc = page.getByRole('navigation', { name: '목차' });
    const current = toc.locator('a[aria-current="location"]');

    // 첫 소제목 전에는 강조 없음
    await expect(current).toHaveCount(0);

    await page.evaluate(
      (id) => document.getElementById(id)?.scrollIntoView(),
      decodeURIComponent(target.url.slice(1)),
    );

    await expect(current).toHaveCount(1);
    await expect(current).toHaveText(target.title);

    // 페이지 끝에서는 마지막 소제목
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(current).toHaveText(entries.at(-1)?.title ?? '');
  });
});
