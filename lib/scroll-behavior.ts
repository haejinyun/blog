/** 스크롤 이동 방식. 사용자가 동작 줄이기(prefers-reduced-motion)를 켰으면 바로 이동한다. 브라우저에서만 호출한다. */
export function getPreferredScrollBehavior(): ScrollBehavior {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return prefersReducedMotion ? 'auto' : 'smooth';
}
