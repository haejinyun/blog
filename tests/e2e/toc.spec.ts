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

  test('목차 항목을 누르면 한 번에 점프하지 않고 여러 프레임에 걸쳐 스크롤한다', async ({
    page,
  }) => {
    const post = postsWithToc[0];
    test.skip(!post, '목차가 있는 글이 없음');
    if (!post) return;

    const last = flattenToc(post.toc).at(-1);
    if (!last) return;

    await page.goto(`/blog/${post.slug}`);
    // 클릭 직후부터 매 프레임의 스크롤 위치를 모은다
    await page.evaluate(() => {
      const positions: number[] = [];
      (window as unknown as { scrollPositions: number[] }).scrollPositions = positions;
      const record = () => {
        positions.push(window.scrollY);
        if (positions.length < 120) requestAnimationFrame(record);
      };
      requestAnimationFrame(record);
    });
    await page
      .getByRole('navigation', { name: '목차' })
      .getByRole('link', { name: last.title })
      .click();
    await expect(page.locator(`[id="${last.url.slice(1)}"]`)).toBeInViewport();

    const positions = await page.evaluate(
      () => (window as unknown as { scrollPositions: number[] }).scrollPositions,
    );
    const distinctPositions = new Set(positions);
    // 0(시작)과 도착 위치 사이의 중간 위치가 있어야 부드럽게 이동한 것이다
    expect(distinctPositions.size).toBeGreaterThan(3);
  });

  test('동작 줄이기 설정이면 목차 항목을 눌렀을 때 바로 이동한다', async ({ page }) => {
    const post = postsWithToc[0];
    test.skip(!post, '목차가 있는 글이 없음');
    if (!post) return;

    const last = flattenToc(post.toc).at(-1);
    if (!last) return;

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/blog/${post.slug}`);
    await page
      .getByRole('navigation', { name: '목차' })
      .getByRole('link', { name: last.title })
      .click();

    const heading = page.locator(`[id="${last.url.slice(1)}"]`);
    await expect(heading).toBeInViewport();
    await expect(page).toHaveURL(new RegExp(`${encodeURIComponent(last.url.slice(1))}$`));
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
