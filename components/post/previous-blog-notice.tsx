import { siteConfig } from '@/lib/config';

/** 글 목록 아래 안내: 아직 옮기지 않은 이전 글은 velog 에 있다 */
export function PreviousBlogNotice() {
  return (
    <aside
      aria-label="이전 글 안내"
      className="mt-section border-t border-border pt-6 text-muted-foreground"
    >
      <p>
        이전 글은 velog에서 볼 수 있어요.{' '}
        <a
          href={siteConfig.previousBlogUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline underline-offset-4 hover:no-underline"
        >
          velog 보기 ↗
        </a>
      </p>
    </aside>
  );
}
