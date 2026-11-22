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
  title: 'paori',
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
  /** 옮기기 전 블로그. 아직 옮기지 않은 글이 있어서 /blog 목록 아래에 안내한다. 다 옮기면 지운다 */
  previousBlogUrl: 'https://velog.io/@haejinyun',
  /** 검색엔진 사이트 소유 확인 값 (비밀 정보 아님). Google 은 DNS TXT 레코드로 인증해서 여기 없다 */
  searchVerification: {
    naver: '18885e59b8985088cb65cfc44447570182740b80',
  },
} as const;

/** 사이트 내부 경로('/blog/foo')를 절대 URL 로 만든다. */
export function toAbsoluteUrl(path: string): string {
  return new URL(path, `${siteConfig.url}/`).toString();
}
