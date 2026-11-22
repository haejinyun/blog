'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationLinkProps {
  href: Route;
  label: string;
}

/** 현재 경로가 메뉴 경로이거나 그 하위 경로인지 (예: /blog/<slug> 는 Blog) */
function isCurrentSection(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** 상단 메뉴 링크. 지금 보고 있는 메뉴만 강조색 배경을 칠한다. */
export function NavigationLink({ href, label }: NavigationLinkProps) {
  const pathname = usePathname();

  if (isCurrentSection(pathname, href)) {
    return (
      <Link
        href={href}
        aria-current="page"
        className="rounded-sm bg-highlight px-0.5 py-element sm:px-[7px] text-foreground"
      >
        {label}
      </Link>
    );
  }

  return (
    <Link href={href} className="px-0.5 py-element sm:px-[7px] hover:text-foreground">
      {label}
    </Link>
  );
}
