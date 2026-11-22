import { expect, test } from '@playwright/test';
import { featuredProjects, publishedPosts } from '../support/built-content';

/** Phase 4 완료 조건: 홈에서 최근 글과 대표 프로젝트로 이동할 수 있다. */

const RECENT_POST_COUNT = 5;

test.describe('홈', () => {
  test('최근 글이 최신순으로 최대 5개 보인다', async ({ page }) => {
    await page.goto('/');

    const section = page.getByRole('region', { name: '최근 글' });
    const expected = publishedPosts.slice(0, RECENT_POST_COUNT).map((post) => post.title);
    await expect(section.locator('article h3')).toHaveText(expected);
  });

  test('최근 글을 누르면 글 상세로 이동한다', async ({ page }) => {
    const [latest] = publishedPosts;
    test.skip(!latest, '공개 글이 없음');
    if (!latest) return;

    await page.goto('/');
    await page
      .getByRole('region', { name: '최근 글' })
      .getByRole('link', { name: latest.title })
      .click();

    await expect(page).toHaveURL(`/blog/${latest.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(latest.title);
  });

  // [숨김] 메뉴·홈 섹션이 주석 처리되어 있어서 skip. 다시 열면 test.skip → test 로 되돌린다 (app/page.tsx, components/layout/site-header.tsx)
  test.skip('대표 프로젝트가 featuredOrder 순서로 보인다', async ({ page }) => {
    await page.goto('/');

    const section = page.getByRole('region', { name: '대표 프로젝트' });
    await expect(section.locator('article h3')).toHaveText(
      featuredProjects.map((project) => project.title),
    );
  });

  // [숨김] 메뉴·홈 섹션이 주석 처리되어 있어서 skip. 다시 열면 test.skip → test 로 되돌린다 (app/page.tsx, components/layout/site-header.tsx)
  test.skip('대표 프로젝트를 누르면 프로젝트 상세로 이동한다', async ({ page }) => {
    const [first] = featuredProjects;
    test.skip(!first, '대표 프로젝트가 없음');
    if (!first) return;

    await page.goto('/');
    await page
      .getByRole('region', { name: '대표 프로젝트' })
      .getByRole('link', { name: first.title })
      .click();

    await expect(page).toHaveURL(`/projects/${first.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(first.title);
  });

  test('전체 글 링크로 글 목록에 이동한다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: '전체 글' }).click();
    await expect(page).toHaveURL('/blog');
  });

  // [숨김] 메뉴·홈 섹션이 주석 처리되어 있어서 skip. 다시 열면 test.skip → test 로 되돌린다 (app/page.tsx, components/layout/site-header.tsx)
  test.skip('전체 프로젝트 링크로 프로젝트 목록에 이동한다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: '전체 프로젝트' }).click();
    await expect(page).toHaveURL('/projects');
  });
});
