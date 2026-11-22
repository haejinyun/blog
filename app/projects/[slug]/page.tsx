import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleWithToc } from '@/components/mdx/article-with-toc';
import { ProjectHeader } from '@/components/project/project-header';
import { JsonLdScript } from '@/components/seo/json-ld-script';
import { projectRepository } from '@/lib/content';
import { decodeParam, toStaticParams } from '@/lib/route-params';
import { projectPath } from '@/lib/routes';
import { createBreadcrumbJsonLd } from '@/lib/seo/json-ld';
import { createPageMetadata } from '@/lib/seo/metadata';

export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = await projectRepository.getAllProjects();
  return toStaticParams(
    'slug',
    projects.map((project) => project.slug),
  );
}

async function getProjectFromParams(params: PageProps<'/projects/[slug]'>['params']) {
  const { slug } = await params;
  return projectRepository.getProjectBySlug(decodeParam(slug));
}

export async function generateMetadata({
  params,
}: PageProps<'/projects/[slug]'>): Promise<Metadata> {
  const project = await getProjectFromParams(params);
  if (!project) return {};

  return createPageMetadata({
    title: project.title,
    description: project.description,
    path: projectPath(project.slug),
  });
}

export default async function ProjectPage({ params }: PageProps<'/projects/[slug]'>) {
  const project = await getProjectFromParams(params);
  if (!project) notFound();

  return (
    <article className="flex flex-col gap-10">
      <JsonLdScript
        data={createBreadcrumbJsonLd([
          { name: '홈', path: '/' },
          { name: 'Projects', path: '/projects' },
          { name: project.title, path: projectPath(project.slug) },
        ])}
      />
      <ProjectHeader project={project} />
      <ArticleWithToc code={project.body} toc={project.toc} />
    </article>
  );
}
