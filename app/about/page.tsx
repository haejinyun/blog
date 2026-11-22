import type { Metadata } from 'next';
import { PageHeading } from '@/components/layout/page-heading';
import { MdxArticle } from '@/components/mdx/mdx-article';
import { PostDate } from '@/components/post/post-date';
import { JsonLdScript } from '@/components/seo/json-ld-script';
import { siteConfig } from '@/lib/config';
import { aboutRepository } from '@/lib/content';
import { createPersonJsonLd } from '@/lib/seo/json-ld';
import { createPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const about = await aboutRepository.getAbout();
  return createPageMetadata({ title: about.title, description: about.description, path: '/about' });
}

export default async function AboutPage() {
  const about = await aboutRepository.getAbout();

  return (
    <div className="flex flex-col gap-10">
      <JsonLdScript data={createPersonJsonLd()} />
      <div className="flex flex-col gap-4 border-b border-border pb-8">
        <PageHeading title={about.title} description={about.description} />
        <div className="flex flex-wrap items-center gap-4 text-caption tracking-caption text-muted-foreground">
          <span>
            최종 수정 <PostDate date={about.updated} />
          </span>
          {about.resumePdf && (
            <a
              href={about.resumePdf}
              download
              className="text-foreground underline underline-offset-4 hover:no-underline"
            >
              이력서 PDF 다운로드
            </a>
          )}
        </div>
      </div>
      <MdxArticle code={about.body} />
      {/* 연락처는 이메일만 공개한다 (전화번호·주소 금지). 값은 lib/config.ts 에서만 관리 */}
      <section aria-labelledby="contact-heading" className="flex flex-col gap-2">
        <h2 id="contact-heading" className="text-body font-normal">
          연락처
        </h2>
        <a
          href={`mailto:${siteConfig.author.email}`}
          className="underline underline-offset-4 hover:no-underline"
        >
          {siteConfig.author.email}
        </a>
      </section>
    </div>
  );
}
