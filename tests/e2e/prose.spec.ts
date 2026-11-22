import { expect, test } from '@playwright/test';
import { publishedPosts } from '../support/built-content';

/** 본문 스타일(Tailwind Typography)이 글 내용에 글자나 모양을 덧붙이지 않는지 확인한다. */
test.describe('글 본문 스타일', () => {
  test('인용문에 따옴표가 자동으로 붙지 않고 기울이지 않는다', async ({ page }) => {
    const post = publishedPosts.find((entry) => entry.body.includes('blockquote'));
    test.skip(!post, '인용문이 있는 글이 없음');
    if (!post) return;

    await page.goto(`/blog/${post.slug}`);
    const blockquote = page.locator('main article blockquote').first();
    const style = await blockquote.evaluate((element) => {
      const paragraphs = element.querySelectorAll('p');
      const first = paragraphs[0];
      const last = paragraphs[paragraphs.length - 1];
      return {
        fontStyle: getComputedStyle(element).fontStyle,
        fontWeight: getComputedStyle(element).fontWeight,
        before: first ? getComputedStyle(first, '::before').content : 'none',
        after: last ? getComputedStyle(last, '::after').content : 'none',
      };
    });

    expect(style).toEqual({
      fontStyle: 'normal',
      fontWeight: '400',
      before: 'none',
      after: 'none',
    });
  });
});
