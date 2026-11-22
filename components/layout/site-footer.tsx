import { siteConfig } from '@/lib/config';
import { PaoriEasterEgg } from './paori-easter-egg';

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-8 text-caption tracking-caption text-muted-foreground uppercase sm:flex-row sm:items-center sm:justify-between">
        {/* 모달(dialog)이 안에 들어가서 p 가 아니라 div (p 안에는 블록 요소를 넣을 수 없다) */}
        <div className="flex items-center gap-1">
          <p>© {siteConfig.author.englishName}</p>
          <PaoriEasterEgg />
        </div>
        <ul className="flex gap-4">
          <li>
            <a href={`mailto:${siteConfig.author.email}`} className="hover:text-foreground">
              Email
            </a>
          </li>
          <li>
            <a href={siteConfig.author.github} className="hover:text-foreground">
              GitHub
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
