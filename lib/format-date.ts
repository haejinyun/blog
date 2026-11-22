import { siteConfig } from '@/lib/config';

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: siteConfig.timeZone,
});

/**
 * ISO 8601 문자열을 '2026년 11월 18일' 형식으로 바꾼다 (한국 시간 기준).
 * 날짜만 적은 frontmatter('2026-11-18')는 UTC 자정이라 한국 시간으로도 같은 날이다.
 */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

/** 'YYYY-MM' 을 '2026년 9월' 형식으로 바꾼다. */
export function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${year}년 ${Number(month)}월`;
}

/** 프로젝트 기간 표시 ('2025년 3월 – 2025년 12월', 끝이 없으면 '– 진행 중') */
export function formatPeriod(startDate: string, endDate?: string): string {
  const end = endDate ? formatYearMonth(endDate) : '진행 중';
  return `${formatYearMonth(startDate)} – ${end}`;
}

/** 이력 기간 표시 ('2023.06 ~ 2024.03', 끝이 없으면 '~ 현재') */
export function formatResumePeriod(startDate: string, endDate?: string): string {
  const toDotted = (yearMonth: string) => yearMonth.replace('-', '.');
  const end = endDate ? toDotted(endDate) : '현재';
  return `${toDotted(startDate)} ~ ${end}`;
}
