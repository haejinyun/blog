import { MdxContent } from './mdx-content';

interface MdxArticleProps {
  code: string;
}

/** 컴파일된 MDX 를 본문 타이포그래피 스타일로 렌더링한다. */
export function MdxArticle({ code }: MdxArticleProps) {
  return (
    <div className="prose max-w-none prose-headings:scroll-mt-20 prose-headings:font-normal prose-headings:tracking-tight prose-img:rounded-sm prose-pre:rounded-sm">
      <MdxContent code={code} />
    </div>
  );
}
