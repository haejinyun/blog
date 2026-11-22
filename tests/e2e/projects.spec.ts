import { expect, test } from '@playwright/test';
import { draftProjects, publishedProjects } from '../support/built-content';

test.describe('/projects 프로젝트 목록', () => {
  // [숨김] 메뉴·홈 섹션이 주석 처리되어 있어서 skip. 다시 열면 test.skip → test 로 되돌린다 (app/page.tsx, components/layout/site-header.tsx)
  test.skip('상단 메뉴에서 프로젝트 목록으로 이동한다', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: '주 메뉴' })
      .getByRole('link', { name: 'Projects' })
      .click();

    await expect(page).toHaveURL('/projects');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects');
  });

  test('공개 프로젝트가 시작일 최신순으로 모두 보인다', async ({ page }) => {
    await page.goto('/projects');

    const titles = page.locator('main article h2');
    await expect(titles).toHaveText(publishedProjects.map((project) => project.title));
  });

  test('draft 프로젝트는 목록에 없다', async ({ page }) => {
    test.skip(draftProjects.length === 0, 'draft 프로젝트가 없음');
    await page.goto('/projects');

    for (const draft of draftProjects) {
      await expect(page.getByText(draft.title)).toHaveCount(0);
    }
  });

  test('목록에서 프로젝트를 누르면 상세 페이지가 열린다', async ({ page }) => {
    const [latest] = publishedProjects;
    test.skip(!latest, '공개 프로젝트가 없음');
    if (!latest) return;

    await page.goto('/projects');
    // 프로젝트 이름이 사이트 이름(헤더 링크)과 같을 수 있어서 main 안에서 찾는다
    await page.getByRole('main').getByRole('link', { name: latest.title, exact: true }).click();

    await expect(page).toHaveURL(`/projects/${latest.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(latest.title);
  });
});

test.describe('/projects/[slug] 프로젝트 상세', () => {
  for (const project of publishedProjects) {
    test(`"${project.slug}" 상세가 열린다`, async ({ page }) => {
      const response = await page.goto(`/projects/${encodeURIComponent(project.slug)}`);

      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(project.title);
      await expect(page).toHaveTitle(new RegExp(project.title));
    });
  }

  test('draft 프로젝트는 404 페이지를 낸다', async ({ page }) => {
    test.skip(draftProjects.length === 0, 'draft 프로젝트가 없음');

    for (const draft of draftProjects) {
      const response = await page.goto(`/projects/${draft.slug}`);
      expect(response?.status()).toBe(404);
    }
  });

  test('존재하지 않는 프로젝트는 404 페이지를 낸다', async ({ page }) => {
    const response = await page.goto('/projects/this-project-does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('페이지를 찾을 수 없습니다');
  });
});
