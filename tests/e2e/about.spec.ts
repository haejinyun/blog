import { expect, test } from '@playwright/test';
import { siteConfig } from '../../lib/config';
import { builtAbout } from '../support/built-content';

test.describe('/about', () => {
  test('상단 메뉴에서 이력 페이지로 이동한다', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: '주 메뉴' })
      .getByRole('link', { name: 'About' })
      .click();

    await expect(page).toHaveURL('/about');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(siteConfig.author.name);
  });

  test('상단에 직함, 이름, 한 줄 소개, GitHub 링크가 보인다', async ({ page }) => {
    await page.goto('/about');

    const hero = page.getByRole('main').locator('header').first();
    await expect(hero.getByText(builtAbout.role)).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(siteConfig.author.name);
    await expect(hero.getByText(builtAbout.headline)).toBeVisible();
    await expect(hero.locator(`a[href="${siteConfig.author.github}"]`)).toBeVisible();
  });

  test('내용이 있는 섹션만 순서대로 보인다', async ({ page }) => {
    await page.goto('/about');

    const expected = [
      'Introduce',
      'Skills',
      ...(builtAbout.work.length > 0 ? ['Work'] : []),
      ...(builtAbout.projects.length > 0 ? ['Courses / Projects'] : []),
      ...(builtAbout.education.length > 0 ? ['Education'] : []),
    ];
    await expect(page.getByRole('main').getByRole('heading', { level: 2 })).toHaveText(expected);
  });

  test('경력 항목마다 이름과 기간이 보인다', async ({ page }) => {
    await page.goto('/about');
    const work = page.getByRole('region', { name: 'Work' });

    for (const entry of builtAbout.work) {
      const item = work.getByRole('article').filter({ hasText: entry.title });
      await expect(item).toHaveCount(1);
      await expect(item).toContainText(entry.startDate.replace('-', '.'));
    }
  });

  test('이력 항목 아래에 기술 스택과 링크가 보인다', async ({ page }) => {
    await page.goto('/about');
    const entries = [...builtAbout.work, ...builtAbout.projects, ...builtAbout.education];

    for (const entry of entries) {
      const item = page.getByRole('article').filter({ hasText: entry.title });
      if (entry.techStack.length > 0) {
        await expect(item).toContainText(entry.techStack.join(', '));
      }
      const links = item.getByRole('list', { name: '링크' }).getByRole('link');
      await expect(links).toHaveCount(entry.links.length);
      for (const [index, link] of entry.links.entries()) {
        await expect(links.nth(index)).toHaveAttribute('href', link.url);
      }
    }
  });

  test('스킬 목록이 모두 보인다', async ({ page }) => {
    await page.goto('/about');
    const skills = page.getByRole('region', { name: 'Skills' }).getByRole('listitem');

    await expect(skills).toHaveText(builtAbout.skills);
  });

  test('연락처로 이메일만 보인다', async ({ page }) => {
    await page.goto('/about');

    const contact = page.getByRole('region', { name: '연락처' });
    await expect(contact.getByRole('link')).toHaveCount(1);
    await expect(contact.getByRole('link')).toHaveAttribute(
      'href',
      `mailto:${siteConfig.author.email}`,
    );
  });

  test('이력서 PDF 가 있을 때만 다운로드 링크가 보인다', async ({ page }) => {
    await page.goto('/about');
    const pdfLink = page.getByRole('link', { name: '이력서 PDF 다운로드' });

    if (!builtAbout.resumePdf) {
      await expect(pdfLink).toHaveCount(0);
      return;
    }
    await expect(pdfLink).toHaveAttribute('href', builtAbout.resumePdf);
    const response = await page.request.get(builtAbout.resumePdf);
    expect(response.ok()).toBe(true);
  });
});
