import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface HomeSectionProps {
  id: string;
  title: string;
  moreHref: Route;
  moreLabel: string;
  children: ReactNode;
}

/** 홈의 섹션 (제목 + 전체 보기 링크 + 내용) */
export function HomeSection({ id, title, moreHref, moreLabel, children }: HomeSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <h2 id={headingId} className="text-body font-normal">
          {title}
        </h2>
        <Link
          href={moreHref}
          className="text-caption tracking-caption text-muted-foreground hover:text-foreground"
        >
          {moreLabel} →
        </Link>
      </div>
      {children}
    </section>
  );
}
