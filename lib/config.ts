/**
 * 사이트 전역 설정. 사이트 URL·작성자 정보는 이 파일에서만 관리한다.
 */

const DEFAULT_SITE_URL = 'http://localhost:3000';

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, '');
}

export const siteConfig = {
  url: resolveSiteUrl(),
  title: 'haejinlog',
  description: '안녕하세요, 윤해진입니다.',
  locale: 'ko_KR',
  language: 'ko',
  /** 날짜 표시 기준 시간대 */
  timeZone: 'Asia/Seoul',
  author: {
    name: '윤해진',
    englishName: 'Haejin Yun',
    email: 'dbshaejin@gmail.com',
    github: 'https://github.com/haejinyun',
  },
} as const;

/** 사이트 내부 경로('/blog/foo')를 절대 URL 로 만든다. */
export function toAbsoluteUrl(path: string): string {
  return new URL(path, `${siteConfig.url}/`).toString();
}
