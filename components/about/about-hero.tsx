import { siteConfig } from '@/lib/config';

interface AboutHeroProps {
  role: string;
  headline: string;
  resumePdf?: string;
}

/** 이력 페이지 상단: 직함, 이름, 한 줄 소개, 연락처 */
export function AboutHero({ role, headline, resumePdf }: AboutHeroProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-10">
      <p className="text-caption tracking-caption text-muted-foreground uppercase">{role}</p>
      <h1 className="text-heading-sm font-normal sm:text-heading-lg">{siteConfig.author.name}</h1>
      <p className="break-keep text-muted-foreground sm:text-body">{headline}</p>
      <div className="flex flex-wrap items-center gap-4 text-caption tracking-caption">
        {/* 연락처는 이메일만 공개한다 (전화번호·주소 금지). 값은 lib/config.ts 에서만 관리 */}
        <section aria-label="연락처">
          <a
            href={`mailto:${siteConfig.author.email}`}
            className="underline underline-offset-4 hover:no-underline"
          >
            {siteConfig.author.email}
          </a>
        </section>
        <a
          href={siteConfig.author.github}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:no-underline"
        >
          GitHub ↗
        </a>
        {resumePdf && (
          <a href={resumePdf} download className="underline underline-offset-4 hover:no-underline">
            이력서 PDF 다운로드
          </a>
        )}
      </div>
    </header>
  );
}
