import { expect, test } from '@playwright/test';
import { draftOnlyTags, getPostsByTag, publishedTags } from '../support/built-content';

test.describe('/tags/[tag] 태그 페이지', () => {
  for (const tag of publishedTags) {
    test(`"${tag}" 태그 글 목록이 보인다`, async ({ page }) => {
      const response = await page.goto(`/tags/${encodeURIComponent(tag)}`);

      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(`#${tag}`);
      await expect(page.locator('main article h2')).toHaveText(
        getPostsByTag(tag).map((post) => post.title),
      );
    });
  }

  test('글의 태그를 누르면 태그 페이지로 이동한다', async ({ page }) => {
    const post = getPostsByTag(publishedTags[0] ?? '')[0];
    test.skip(!post, '태그가 달린 글이 없음');
    if (!post) return;

    await page.goto(`/blog/${post.slug}`);
    const [tag] = post.tags;
    await page.getByRole('link', { name: `#${tag}`, exact: true }).click();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`#${tag}`);
  });

  test('존재하지 않는 태그는 404 페이지를 낸다', async ({ page }) => {
    const response = await page.goto('/tags/this-tag-does-not-exist');
    expect(response?.status()).toBe(404);
  });

  test('draft 글에만 달린 태그는 404 페이지를 낸다', async ({ page }) => {
    test.skip(draftOnlyTags.length === 0, 'draft 전용 태그가 없음');

    for (const tag of draftOnlyTags) {
      const response = await page.goto(`/tags/${encodeURIComponent(tag)}`);
      expect(response?.status()).toBe(404);
    }
  });
});
