import { expect, test } from '@playwright/test';
import {
  draftPosts,
  postsWithImage,
  postsWithThumbnail,
  publishedPosts,
} from '../support/built-content';

test.describe('/blog 글 목록', () => {
  test('공개 글이 최신순으로 모두 보인다', async ({ page }) => {
    await page.goto('/blog');

    const titles = page.locator('main article h2');
    await expect(titles).toHaveText(publishedPosts.map((post) => post.title));
  });

  test('draft 글은 목록에 없다', async ({ page }) => {
    test.skip(draftPosts.length === 0, 'draft 글이 없음');
    await page.goto('/blog');

    for (const draft of draftPosts) {
      await expect(page.getByText(draft.title)).toHaveCount(0);
    }
  });

  test('목록에서 글을 누르면 상세 페이지가 열린다', async ({ page }) => {
    const [latest] = publishedPosts;
    test.skip(!latest, '공개 글이 없음');
    if (!latest) return;

    await page.goto('/blog');
    await page.getByRole('link', { name: latest.title }).click();

    await expect(page).toHaveURL(`/blog/${latest.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(latest.title);
  });
});

test.describe('/blog/[slug] 글 상세', () => {
  for (const post of publishedPosts) {
    test(`"${post.slug}" 상세가 열린다`, async ({ page }) => {
      const response = await page.goto(`/blog/${post.slug}`);

      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(post.title);
      await expect(page).toHaveTitle(new RegExp(post.title));
    });
  }

  test('글 폴더 안 이미지가 정상 표시된다', async ({ page }) => {
    test.skip(postsWithImage.length === 0, '이미지가 있는 글이 없음');

    for (const post of postsWithImage) {
      await page.goto(`/blog/${post.slug}`);
      const images = page.locator('main article img');
      await expect(images.first()).toBeVisible();

      for (const image of await images.all()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
          .toBeGreaterThan(0);
      }
    }
  });

  test('draft 글 주소는 404 페이지를 낸다', async ({ page }) => {
    test.skip(draftPosts.length === 0, 'draft 글이 없음');

    for (const draft of draftPosts) {
      const response = await page.goto(`/blog/${draft.slug}`);
      expect(response?.status()).toBe(404);
    }
  });

  test('존재하지 않는 slug 는 404 페이지를 낸다', async ({ page }) => {
    const response = await page.goto('/blog/this-post-does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('페이지를 찾을 수 없습니다');
  });
});

test.describe('대표 이미지', () => {
  test('목록에 미리보기 이미지가 있는 글만 이미지가 보이고 정상 표시된다', async ({ page }) => {
    await page.goto('/blog');

    for (const post of publishedPosts) {
      const item = page.locator('main article').filter({ hasText: post.title });
      const image = item.locator('img');
      if (!post.previewImage) {
        await expect(image).toHaveCount(0);
        continue;
      }
      await expect(image).toHaveAttribute('src', post.previewImage);
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
        .toBeGreaterThan(0);
    }
  });

  test('대표 이미지가 있는 글은 상단에 대표 이미지가 보인다', async ({ page }) => {
    test.skip(postsWithThumbnail.length === 0, '대표 이미지가 있는 글이 없음');

    for (const post of postsWithThumbnail) {
      await page.goto(`/blog/${encodeURIComponent(post.slug)}`);
      const cover = page.locator('main > article > img');
      await expect(cover).toHaveAttribute('src', post.thumbnail ?? '');
      await expect(cover).toBeInViewport();
      await expect
        .poll(() => cover.evaluate((element: HTMLImageElement) => element.naturalWidth))
        .toBeGreaterThan(0);
    }
  });
});
