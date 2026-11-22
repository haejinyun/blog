'use client';

import { type MouseEvent, useEffect, useState } from 'react';
import type { TocItem } from '@/lib/content';
import { getPreferredScrollBehavior } from '@/lib/scroll-behavior';

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

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

/**
 * 목차 링크를 누르면 소제목까지 부드럽게 스크롤하고 주소의 #해시를 바꾼다.
 * 새 탭 열기(보조 키·가운데 버튼)나 소제목을 못 찾은 경우는 브라우저 기본 이동에 맡긴다.
 * 고정 헤더에 가리지 않는 위치는 소제목의 scroll-margin-top 이 정한다.
 */
function scrollToHeading(event: MouseEvent<HTMLAnchorElement>, url: string): void {
  if (isModifiedClick(event)) return;
  const heading = document.getElementById(decodeURIComponent(url.slice(1)));
  if (!heading) return;

  event.preventDefault();
  scrollHeadingIntoView(heading, MAX_SCROLL_CORRECTIONS);
  history.pushState(null, '', url);
}

/** 스크롤 중에 이미지가 늦게 로드되면 소제목이 밀려난다. 도착 뒤 위치를 다시 맞추는 최대 횟수 */
const MAX_SCROLL_CORRECTIONS = 3;
const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

/** 소제목이 scroll-margin-top 위치에 있는지 (1px 오차 허용) */
function isHeadingInPlace(heading: HTMLElement): boolean {
  const scrollMarginTop = Number.parseFloat(getComputedStyle(heading).scrollMarginTop) || 0;
  return Math.abs(heading.getBoundingClientRect().top - scrollMarginTop) <= 1;
}

/**
 * 소제목으로 스크롤하고, 스크롤이 끝났을 때 제자리가 아니면 다시 스크롤한다.
 * 사용자가 그 사이에 직접 스크롤하면 보정을 멈춘다. scrollend 를 지원하지 않는 브라우저는 보정 없이 한 번만 이동한다.
 */
function scrollHeadingIntoView(heading: HTMLElement, remainingCorrections: number): void {
  heading.scrollIntoView({ behavior: getPreferredScrollBehavior(), block: 'start' });
  if (remainingCorrections === 0 || !('onscrollend' in window)) return;

  const controller = new AbortController();
  const { signal } = controller;
  for (const type of USER_SCROLL_EVENTS) {
    window.addEventListener(type, () => controller.abort(), { once: true, signal });
  }
  window.addEventListener(
    'scrollend',
    () => {
      controller.abort();
      if (isHeadingInPlace(heading) || isScrolledToBottom()) return;
      scrollHeadingIntoView(heading, remainingCorrections - 1);
    },
    { once: true, signal },
  );
}

const TOC_LINK_CLASS = {
  active: 'border-l-2 border-foreground pl-2 text-foreground',
  inactive: 'border-l-2 border-transparent pl-2 text-muted-foreground hover:text-foreground',
};

function TocLink({ item, isActive }: { item: TocItem; isActive: boolean }) {
  return (
    <a
      href={item.url}
      aria-current={isActive ? 'location' : undefined}
      onClick={(event) => scrollToHeading(event, item.url)}
      className={isActive ? TOC_LINK_CLASS.active : TOC_LINK_CLASS.inactive}
    >
      {item.title}
    </a>
  );
}
