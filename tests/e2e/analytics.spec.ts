import { expect, test } from '@playwright/test';
import { publishedPosts } from '../support/built-content';

/** Vercel Web Analytics 스크립트는 배포 환경에서만 있다. 로컬 preview 에서는 404 이므로 "실패한 상황"을 그대로 확인할 수 있다. */
const ANALYTICS_SCRIPT_PATH = '/_vercel/insights/script.js';

test('분석 스크립트를 불러오지 못해도 글 본문이 열린다', async ({ page }) => {
  const [post] = publishedPosts;
  test.skip(!post, '공개 글이 없음');
  if (!post) return;

  const analyticsResponse = page.waitForResponse((response) =>
    response.url().endsWith(ANALYTICS_SCRIPT_PATH),
  );
  await page.goto(`/blog/${post.slug}`);

  expect((await analyticsResponse).ok()).toBe(false);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(post.title);
  await expect(page.locator('main article')).toBeVisible();
});
