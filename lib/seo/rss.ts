import { siteConfig, toAbsoluteUrl } from '@/lib/config';
import type { PostMeta } from '@/lib/content';
import { postPath, RSS_PATH } from '@/lib/routes';

/** RSS 2.0 피드 XML 생성. 의존성 없이 문자열로 만들고, 모든 텍스트 값은 escapeXml 을 거친다. */

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char);
}

/** ISO 8601 → RFC 822 (RSS 날짜 형식) */
function toRfc822(isoDate: string): string {
  return new Date(isoDate).toUTCString();
}

function renderItem(post: PostMeta): string {
  const url = escapeXml(toAbsoluteUrl(postPath(post.slug)));
  const categories = post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`);
  return [
    '<item>',
    `<title>${escapeXml(post.title)}</title>`,
    `<link>${url}</link>`,
    `<guid isPermaLink="true">${url}</guid>`,
    `<description>${escapeXml(post.description)}</description>`,
    `<pubDate>${toRfc822(post.date)}</pubDate>`,
    ...categories,
    '</item>',
  ].join('');
}

/** posts 는 최신순으로 정렬된 공개 글 */
export function buildRssFeed(posts: PostMeta[]): string {
  const latest = posts[0];
  const lastBuildDate = latest ? `<lastBuildDate>${toRfc822(latest.date)}</lastBuildDate>` : '';

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `<title>${escapeXml(siteConfig.title)}</title>`,
    `<link>${escapeXml(toAbsoluteUrl('/'))}</link>`,
    `<description>${escapeXml(siteConfig.description)}</description>`,
    `<language>${siteConfig.language}</language>`,
    `<atom:link href="${escapeXml(toAbsoluteUrl(RSS_PATH))}" rel="self" type="application/rss+xml"/>`,
    lastBuildDate,
    ...posts.map(renderItem),
    '</channel>',
    '</rss>',
  ].join('\n');
}
