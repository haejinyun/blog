import { expect, test } from '@playwright/test';
import { publishedPosts } from '../support/built-content';

/** 코드 블록(Shiki 하이라이팅)과 인라인 코드가 있는 글 */
const postWithCode = publishedPosts.find((post) => post.body.includes('shiki'));

test.describe('글 본문 코드', () => {
  test('코드 블록이 빌드 시 하이라이팅되고 디자인 토큰 배경을 쓴다', async ({ page }) => {
    test.skip(!postWithCode, '코드 블록이 있는 글이 없음');
    if (!postWithCode) return;

    await page.goto(`/blog/${postWithCode.slug}`);
    const codeBlock = page.locator('main pre.shiki').first();
    await expect(codeBlock).toBeVisible();
    // 언어가 있는 블록의 토큰(span)에 색이 들어가 있다. 언어 표시가 없는 블록은 일반 텍스트라 색이 없다
    await expect(page.locator('main pre.shiki span[style*="color"]').first()).toBeAttached();
    // Shiki 테마 배경 대신 디자인 토큰(Ink #1a1915)
    await expect(codeBlock).toHaveCSS('background-color', 'rgb(26, 25, 21)');
  });

  test('인라인 코드에 백틱이 붙지 않는다', async ({ page }) => {
    test.skip(!postWithCode, '코드가 있는 글이 없음');
    if (!postWithCode) return;

    await page.goto(`/blog/${postWithCode.slug}`);
    const inlineCode = page.locator('main .prose :not(pre) > code').first();
    test.skip((await inlineCode.count()) === 0, '인라인 코드가 없음');

    const pseudoContent = await inlineCode.evaluate((element) => ({
      before: getComputedStyle(element, '::before').content,
      after: getComputedStyle(element, '::after').content,
    }));
    expect(pseudoContent).toEqual({ before: 'none', after: 'none' });
  });
});
