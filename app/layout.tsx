import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { siteConfig } from '@/lib/config';
import './globals.css';

const pretendard = localFont({
  src: '../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  // 모든 페이지 <head> 에 들어간다. 네이버 서치어드바이저는 홈에서 확인한다
  verification: {
    other: { 'naver-site-verification': siteConfig.searchVerification.naver },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={siteConfig.language} className={pretendard.variable}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">{children}</main>
        <SiteFooter />
        {/* Vercel Web Analytics (쿠키 없음). 스크립트는 배포 환경에서 Vercel 이 제공하고, 실패해도 화면에는 영향이 없다 */}
        <Analytics />
      </body>
    </html>
  );
}
