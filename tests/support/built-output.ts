import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * 빌드 결과물(out/ 등) 파일을 읽어 SEO 요소를 꺼내는 헬퍼.
 * Next 가 만든 HTML 은 형식이 일정해서 정규식으로 충분하다.
 */

export const DEFAULT_OUT_DIR = join(process.cwd(), 'out');

/** 사이트 주소가 들어갈 수 있는 텍스트 결과물 (JS 번들은 프레임워크 링크가 섞여 있어 제외) */
const TEXT_EXTENSIONS = ['.html', '.xml', '.txt', '.json'];

export function listFiles(dir: string, extensions: string[]): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name))
    .filter((file) => extensions.some((extension) => file.endsWith(extension)));
}

export function listTextFiles(dir: string): string[] {
  return listFiles(dir, TEXT_EXTENSIONS);
}

/** 빈 동적 경로 대신 만든 404 페이지 (lib/route-params.ts 의 EMPTY_PARAM_PLACEHOLDER) */
const EMPTY_PARAM_PAGE = '__empty__.html';

/** 404 페이지를 제외한, 실제 경로가 있는 HTML 페이지 */
export function listPageHtmlFiles(dir: string): string[] {
  return listFiles(dir, ['.html']).filter((file) => {
    const name = relative(dir, file);
    return name !== '404.html' && name !== '_not-found.html' && !name.endsWith(EMPTY_PARAM_PAGE);
  });
}

export function readOutputFile(dir: string, path: string): string {
  return readFileSync(join(dir, path), 'utf-8');
}

/** 글 slug → 빌드된 HTML 경로 (trailingSlash: false 이므로 blog/<slug>.html) */
export function postHtmlPath(slug: string): string {
  return `blog/${slug}.html`;
}

function decodeHtmlAttribute(value: string): string {
  return value.replaceAll('&amp;', '&').replaceAll('&quot;', '"');
}

export function extractCanonical(html: string): string | undefined {
  const value = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  return value && decodeHtmlAttribute(value);
}

export function extractMetaProperty(html: string, property: string): string | undefined {
  const value = html.match(new RegExp(`<meta property="${property}" content="([^"]+)"`))?.[1];
  return value && decodeHtmlAttribute(value);
}

export type JsonLdNode = { '@type': string } & Record<string, unknown>;

export function extractJsonLd(html: string): JsonLdNode[] {
  const scripts = html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs);
  return [...scripts].map((match) => JSON.parse(match[1] ?? '{}') as JsonLdNode);
}

export function extractSitemapLocations(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    decodeHtmlAttribute(match[1] ?? ''),
  );
}

function matchAll(text: string, pattern: RegExp): string[] {
  return [...text.matchAll(pattern)].map((match) => decodeHtmlAttribute(match[1] ?? ''));
}

/** JSON-LD 안의 모든 문자열 중 절대 URL */
function extractJsonLdUrls(html: string): string[] {
  const collect = (value: unknown): string[] => {
    if (typeof value === 'string') return /^https?:\/\//.test(value) ? [value] : [];
    if (Array.isArray(value)) return value.flatMap(collect);
    if (value && typeof value === 'object') return Object.values(value).flatMap(collect);
    return [];
  };
  return extractJsonLd(html).flatMap(collect);
}

/**
 * 사이트가 자기 주소를 적는 곳의 절대 URL: <head> 의 <link>·<meta>(canonical, og, RSS 등), JSON-LD,
 * sitemap·RSS·robots. 본문 속 외부 링크나 코드 예시('http://localhost:X000')는 콘텐츠라서 포함하지 않는다.
 */
export function extractLinkedUrls(file: string, content: string): string[] {
  if (file.endsWith('.html')) {
    return [
      ...matchAll(content, /<link\s[^>]*href="(https?:\/\/[^"]+)"/g),
      ...matchAll(content, /<meta\s[^>]*content="(https?:\/\/[^"]+)"/g),
      ...extractJsonLdUrls(content),
    ];
  }
  if (file.endsWith('.xml')) {
    return [
      ...matchAll(content, /<(?:loc|link|guid)[^>]*>(https?:\/\/[^<]+)</g),
      ...matchAll(content, /\shref="(https?:\/\/[^"]+)"/g),
    ];
  }
  if (file.endsWith('robots.txt')) return matchAll(content, /^Sitemap:\s*(\S+)/gm);
  return [];
}

/** 링크 검사 대상 파일 (RSC 페이로드 .txt 는 HTML 과 같은 내용이라 제외) */
export function listLinkFiles(dir: string): string[] {
  return listFiles(dir, ['.html', '.xml', 'robots.txt']);
}
