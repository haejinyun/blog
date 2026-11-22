import { expect, test } from '@playwright/test';
import { siteConfig } from '../../lib/config';
import { publishedPosts } from '../support/built-content';

test.describe('상단 헤더', () => {
  test('GitHub 아이콘 링크가 헤더 맨 오른쪽에 있고 새 탭으로 연다', async ({ page }) => {
    await page.goto('/');
    const header = page.getByRole('banner');
    const github = header.getByRole('link', { name: /GitHub/ });

    await expect(github).toHaveAttribute('href', siteConfig.author.github);
    await expect(github).toHaveAttribute('target', '_blank');
    await expect(github).toHaveAttribute('rel', /noopener/);
    await expect(header.getByRole('link').last()).toHaveAccessibleName(/GitHub/);
  });

  test('스크롤해도 헤더가 화면 위에 남아 있다', async ({ page }) => {
    const post = publishedPosts[0];
    test.skip(!post, '공개 글이 없음');
    if (!post) return;

    await page.goto(`/blog/${post.slug}`);
    await page.mouse.wheel(0, 3000);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);

    const box = await page.getByRole('banner').boundingBox();
    expect(box?.y).toBe(0);
  });

  test('좁은 화면에서도 헤더가 가로로 넘치지 않는다', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/blog');
    // 헤더 안쪽 여백(padding)까지 침범하지 않는지: 마지막 요소의 오른쪽 끝이 내용 영역 안에 있어야 한다
    const overflows = await page.getByRole('banner').evaluate((header) => {
      const container = header.firstElementChild as HTMLElement;
      const contentRight =
        container.getBoundingClientRect().right -
        Number.parseFloat(getComputedStyle(container).paddingRight);
      const lastItem = container.lastElementChild as HTMLElement;
      return lastItem.getBoundingClientRect().right > contentRight + 0.5;
    });
    expect(overflows).toBe(false);
  });
});

test.describe('글 상세 맨 위로 버튼', () => {
  test('스크롤하면 나타나고, 누르면 맨 위로 이동한다', async ({ page }) => {
    const post = publishedPosts[0];
    test.skip(!post, '공개 글이 없음');
    if (!post) return;

    await page.goto(`/blog/${post.slug}`);
    const button = page.getByRole('button', { name: '맨 위로' });
    await expect(button).toHaveCount(0);

    await page.mouse.wheel(0, 3000);
    await expect(button).toBeVisible();

    await button.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(button).toHaveCount(0);
  });

  test('글 목록에는 맨 위로 버튼이 없다', async ({ page }) => {
    await page.goto('/blog');
    await page.mouse.wheel(0, 3000);
    await expect(page.getByRole('button', { name: '맨 위로' })).toHaveCount(0);
  });
});

test.describe('푸터 파오리 이스터에그', () => {
  test('파오리를 누르면 모달이 열리고 Esc 로 닫힌다', async ({ page }) => {
    await page.goto('/');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeHidden();

    await page.getByRole('contentinfo').getByRole('button', { name: '파오리' }).click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('닫기 버튼으로 모달을 닫는다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('button', { name: '파오리' }).click();
    await page.getByRole('dialog').getByRole('button', { name: '닫기' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});
