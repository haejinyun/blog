import { expect, test } from '@playwright/test';
import { allSeries, getSeriesPosts } from '../support/built-content';

const seriesWithPosts = allSeries.filter((series) => getSeriesPosts(series.slug).length > 0);

test.describe('/series 시리즈 목록', () => {
  test('상단 메뉴에서 시리즈 목록으로 이동할 수 있다', async ({ page }) => {
    await page.goto('/blog');
    await page
      .getByRole('navigation', { name: '주 메뉴' })
      .getByRole('link', { name: 'Series' })
      .click();

    await expect(page).toHaveURL('/series');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Series');
  });

  test('공개 글이 있는 시리즈가 모두 보인다', async ({ page }) => {
    await page.goto('/series');

    const titles = page.locator('main article h2');
    await expect(titles).toHaveCount(seriesWithPosts.length);
    for (const series of seriesWithPosts) {
      const card = page.locator('main article', { hasText: series.title });
      await expect(card).toContainText(`글 ${getSeriesPosts(series.slug).length}개`);
    }
  });

  test('시리즈를 누르면 시리즈 상세로 이동한다', async ({ page }) => {
    const [series] = seriesWithPosts;
    test.skip(!series, '공개 글이 있는 시리즈가 없음');
    if (!series) return;

    await page.goto('/series');
    await page.getByRole('link', { name: series.title }).click();

    await expect(page).toHaveURL(`/series/${series.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(series.title);
  });
});
