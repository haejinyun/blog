'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/lib/content';

interface TableOfContentsProps {
  items: TocItem[];
}

/** 소제목이 화면 위에서 이 거리(px) 안으로 올라오면 "지금 읽는 섹션"으로 본다. 고정 헤더(66px) + 여유 */
const ACTIVE_OFFSET_Y = 120;

function flattenTocUrls(items: TocItem[]): string[] {
  return items.flatMap((item) => [item.url, ...flattenTocUrls(item.items)]);
}

function isScrolledToBottom(): boolean {
  return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
}

/**
 * 지금 읽고 있는 섹션의 목차 url ('#id').
 * 위로 지나간 소제목 중 마지막 것. 첫 소제목 전이면 null, 페이지 끝이면 마지막 소제목
 * (마지막 섹션이 짧으면 소제목이 화면 위까지 올라오지 못하기 때문).
 */
function findActiveUrl(urls: string[]): string | null {
  if (isScrolledToBottom()) return urls.at(-1) ?? null;

  let activeUrl: string | null = null;
  for (const url of urls) {
    const heading = document.getElementById(decodeURIComponent(url.slice(1)));
    if (!heading) continue;
    if (heading.getBoundingClientRect().top > ACTIVE_OFFSET_Y) break;
    activeUrl = url;
  }
  return activeUrl;
}

function useActiveTocUrl(items: TocItem[]): string | null {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  useEffect(() => {
    const urls = flattenTocUrls(items);
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActiveUrl(findActiveUrl(urls)));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [items]);

  return activeUrl;
}

/** 글·프로젝트 목차. 지금 읽고 있는 섹션의 항목을 강조한다. */
export function TableOfContents({ items }: TableOfContentsProps) {
  const activeUrl = useActiveTocUrl(items);

  if (items.length === 0) return null;

  return (
    <nav aria-labelledby="toc-heading" className="text-sm">
      <h2
        id="toc-heading"
        className="mb-3 text-caption tracking-caption text-muted-foreground uppercase"
      >
        목차
      </h2>
      <TocList items={items} activeUrl={activeUrl} />
    </nav>
  );
}

interface TocListProps {
  items: TocItem[];
  activeUrl: string | null;
}

function TocList({ items, activeUrl }: TocListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.url} className="flex flex-col gap-2">
          <TocLink item={item} isActive={item.url === activeUrl} />
          {item.items.length > 0 && (
            <div className="pl-3">
              <TocList items={item.items} activeUrl={activeUrl} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function TocLink({ item, isActive }: { item: TocItem; isActive: boolean }) {
  if (isActive) {
    return (
      <a
        href={item.url}
        aria-current="location"
        className="border-l-2 border-foreground pl-2 text-foreground"
      >
        {item.title}
      </a>
    );
  }

  return (
    <a
      href={item.url}
      className="border-l-2 border-transparent pl-2 text-muted-foreground hover:text-foreground"
    >
      {item.title}
    </a>
  );
}
