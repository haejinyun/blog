import { TableOfContents } from '@/components/post/table-of-contents';
import type { TocItem } from '@/lib/content';
import { MdxArticle } from './mdx-article';

interface ArticleWithTocProps {
  code: string;
  toc: TocItem[];
}

/** MDX 본문 + 목차. 넓은 화면에서는 목차가 본문 오른쪽에 고정되고, 좁은 화면에서는 본문 위에 온다. */
export function ArticleWithToc({ code, toc }: ArticleWithTocProps) {
  return (
    <div className="relative">
      {toc.length > 0 && (
        <aside className="mb-10 rounded-sm border border-border bg-surface p-card xl:absolute xl:top-0 xl:left-full xl:mb-0 xl:ml-8 xl:h-full xl:w-56 xl:border-0 xl:bg-transparent xl:p-0">
          <div className="xl:sticky xl:top-24">
            <TableOfContents items={toc} />
          </div>
        </aside>
      )}
      <MdxArticle code={code} />
    </div>
  );
}
