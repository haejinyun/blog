import { expect, type Locator, test } from '@playwright/test';
import { allSeries, getSeriesPosts } from '../support/built-content';

test.describe('/series/[slug] 시리즈 페이지', () => {
  for (const series of allSeries) {
    test(`"${series.slug}" 에 소개 본문과 글 목록이 순서대로 보인다`, async ({ page }) => {
      await page.goto(`/series/${series.slug}`);

      await expect(page.getByRole('heading', { level: 1 })).toHaveText(series.title);
      await expect(page.locator('main .prose')).not.toBeEmpty();

      const titles = page.locator('main ol li a');
      await expect(titles).toHaveText(getSeriesPosts(series.slug).map((post) => post.title));
    });
  }

  test('존재하지 않는 시리즈는 404 페이지를 낸다', async ({ page }) => {
    const response = await page.goto('/series/this-series-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});

test.describe('시리즈 글의 이전/다음 편', () => {
  for (const series of allSeries) {
    const seriesPosts = getSeriesPosts(series.slug);

    seriesPosts.forEach((post, index) => {
      const previous = seriesPosts[index - 1];
      const next = seriesPosts[index + 1];

      test(`"${post.slug}" 에 같은 시리즈의 이전/다음 편 링크가 보인다`, async ({ page }) => {
        await page.goto(`/blog/${post.slug}`);
        const navigation = page.getByRole('navigation', { name: '시리즈 이전/다음 편' });

        await expect(navigation.getByRole('link', { name: series.title })).toHaveAttribute(
          'href',
          `/series/${series.slug}`,
        );
        await expectAdjacentLink(navigation.locator('a[rel="prev"]'), previous);
        await expectAdjacentLink(navigation.locator('a[rel="next"]'), next);
      });
    });
  }
});

async function expectAdjacentLink(
  link: Locator,
  expected: { slug: string; title: string } | undefined,
) {
  if (!expected) {
    await expect(link).toHaveCount(0);
    return;
  }
  await expect(link).toHaveAttribute('href', `/blog/${expected.slug}`);
  await expect(link).toContainText(expected.title);
}
