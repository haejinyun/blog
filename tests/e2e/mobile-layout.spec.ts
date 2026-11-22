import { expect, test } from '@playwright/test';
import { publishedPosts } from '../support/built-content';

/** 가장 좁게 지원하는 화면 너비 (header.spec.ts 의 헤더 넘침 테스트와 같은 값) */
const NARROW_VIEWPORT = { width: 360, height: 800 };

test.describe('모바일 화면에서 글 본문이 가로로 넘치지 않는다', () => {
  test.use({ viewport: NARROW_VIEWPORT });

  for (const post of publishedPosts) {
    test(`"${post.slug}"`, async ({ page }) => {
      await page.goto(`/blog/${post.slug}`);

      // 표·코드 블록처럼 넓은 요소는 자기 상자 안에서만 스크롤되어야 한다
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
    });
  }
});
