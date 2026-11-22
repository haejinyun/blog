import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { GitHubIcon } from '@/components/icons/github-icon';
import { siteConfig } from '@/lib/config';
import { NavigationLink } from './navigation-link';
import siteLogo from './site-logo.png';

const navigationItems: { href: Route; label: string }[] = [
  { href: '/blog', label: 'Blog' },
  { href: '/series', label: 'Series' },
  // [숨김] Projects·About 은 콘텐츠를 채우기 전까지 숨긴다 (2026-11-22 사용자 결정). 다시 열 때 이 파일의 주석 블록을 모두 되돌리고, tests/e2e 의 같은 표시가 있는 test.skip 도 해제한다
  // { href: '/projects', label: 'Projects' },
  // { href: '/about', label: 'About' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-2 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1 text-base font-normal sm:gap-2 sm:text-body-sm"
        >
          {/* 파비콘과 같은 이미지. 옆에 사이트 이름이 있어서 장식용(alt="")으로 둔다 */}
          <Image src={siteLogo} alt="" width={28} height={28} priority />
          {siteConfig.title}
        </Link>
        <div className="flex items-center gap-1 sm:gap-3">
          <nav aria-label="주 메뉴">
            <ul className="flex items-center text-caption tracking-caption text-muted-foreground uppercase sm:gap-element">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <NavigationLink href={item.href} label={item.label} />
                </li>
              ))}
            </ul>
          </nav>
          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub (새 탭에서 열림)"
            className="flex size-7 shrink-0 items-center justify-center rounded-sm text-foreground hover:bg-background sm:size-8"
          >
            <GitHubIcon className="size-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
