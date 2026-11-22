import type { Metadata } from 'next';
import { HomeSection } from '@/components/home/home-section';
import { PostList } from '@/components/post/post-list';
// [숨김] Projects·About 은 콘텐츠를 채우기 전까지 숨긴다 (2026-11-22 사용자 결정). 다시 열 때 이 파일의 주석 블록을 모두 되돌리고, tests/e2e 의 같은 표시가 있는 test.skip 도 해제한다
// import { ProjectList } from '@/components/project/project-list';
import { JsonLdScript } from '@/components/seo/json-ld-script';
import { siteConfig } from '@/lib/config';
// [숨김] import { postRepository, projectRepository } from '@/lib/content';
import { postRepository } from '@/lib/content';
import { createPersonJsonLd } from '@/lib/seo/json-ld';
import { createHomeMetadata } from '@/lib/seo/metadata';

const RECENT_POST_COUNT = 5;

export const metadata: Metadata = createHomeMetadata();

export default async function HomePage() {
  // [숨김] const [posts, featuredProjects] = await Promise.all([
  //   postRepository.getAllPosts(),
  //   projectRepository.getFeaturedProjects(),
  // ]);
  const posts = await postRepository.getAllPosts();

  return (
    <div className="flex flex-col gap-section">
      <JsonLdScript data={createPersonJsonLd()} />
      <section className="flex flex-col gap-3">
        <h1 className="text-4xl font-normal tracking-tight sm:text-heading-lg">
          {siteConfig.description}
        </h1>
        {/* placeholder: 소개 문구는 나중에 작성 */}
        <p className="text-muted-foreground">
          개발하며 배우고 고민한 것들을 기록하고, 만든 것들을 정리합니다.
        </p>
      </section>
      <HomeSection id="recent-posts" title="최근 글" moreHref="/blog" moreLabel="전체 글">
        <PostList posts={posts.slice(0, RECENT_POST_COUNT)} headingLevel="h3" />
      </HomeSection>
      {/* [숨김] 대표 프로젝트 섹션
      <HomeSection
        id="featured-projects"
        title="대표 프로젝트"
        moreHref="/projects"
        moreLabel="전체 프로젝트"
      >
        <ProjectList projects={featuredProjects} headingLevel="h3" />
      </HomeSection>
      */}
    </div>
  );
}
