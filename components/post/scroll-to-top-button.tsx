'use client';

import { useEffect, useState } from 'react';

/** 이만큼 내려가면 버튼을 보여준다 (대략 첫 화면 높이) */
const SHOW_AFTER_SCROLL_Y = 600;

function scrollToTop() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}

/** 글 상세에서 일정 이상 스크롤하면 오른쪽 아래에 나타나는 "맨 위로" 버튼 */
export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setIsVisible(window.scrollY > SHOW_AFTER_SCROLL_Y);
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="맨 위로"
      className="fixed right-4 bottom-4 z-40 rounded-sm border border-border bg-surface px-[7px] py-element text-caption tracking-caption uppercase hover:bg-background"
    >
      Top ↑
    </button>
  );
}
