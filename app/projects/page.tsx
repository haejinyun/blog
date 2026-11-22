import type { Metadata } from 'next';
import { PageHeading } from '@/components/layout/page-heading';
import { ProjectList } from '@/components/project/project-list';
import { projectRepository } from '@/lib/content';
import { createPageMetadata } from '@/lib/seo/metadata';

const description = '문제를 어떻게 정의하고 풀었는지 정리한 프로젝트 기록입니다.';

export const metadata: Metadata = createPageMetadata({
  title: 'Projects',
  description,
  path: '/projects',
});

export default async function ProjectsPage() {
  const projects = await projectRepository.getAllProjects();

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Projects" description={description} />
      <ProjectList projects={projects} />
    </div>
  );
}
