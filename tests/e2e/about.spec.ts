import { expect, test } from '@playwright/test';
import { siteConfig } from '../../lib/config';
import { builtAbout } from '../support/built-content';

test.describe('/about', () => {
  // [숨김] 메뉴·홈 섹션이 주석 처리되어 있어서 skip. 다시 열면 test.skip → test 로 되돌린다 (app/page.tsx, components/layout/site-header.tsx)
  test.skip('상단 메뉴에서 이력 페이지로 이동한다', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: '주 메뉴' })
      .getByRole('link', { name: 'About' })
      .click();

    await expect(page).toHaveURL('/about');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(builtAbout.title);
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
