import { siteConfig } from '@/lib/config';

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-8 text-caption tracking-caption text-muted-foreground uppercase sm:flex-row sm:justify-between">
        <p>© {siteConfig.author.englishName}</p>
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
