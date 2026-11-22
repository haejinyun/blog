import Link from 'next/link';
import type { ProjectMeta } from '@/lib/content';
import { formatPeriod } from '@/lib/format-date';
import { projectPath } from '@/lib/routes';
import { TechStackList } from './tech-stack-list';

interface ProjectListProps {
  projects: ProjectMeta[];
  /** 목록이 섹션 안에 들어가면(홈 등) 'h3' */
  headingLevel?: 'h2' | 'h3';
}

export function ProjectList({ projects, headingLevel = 'h2' }: ProjectListProps) {
  if (projects.length === 0) {
    return <p className="py-6 text-muted-foreground">아직 공개된 프로젝트가 없습니다.</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {projects.map((project) => (
        <li key={project.slug}>
          <ProjectCard project={project} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}

interface ProjectCardProps {
  project: ProjectMeta;
  headingLevel: 'h2' | 'h3';
}

function ProjectCard({ project, headingLevel: Heading }: ProjectCardProps) {
  return (
    <article className="group flex h-full flex-col gap-3 rounded-sm border border-border bg-surface p-card">
      {project.thumbnail && (
        // biome-ignore lint/performance/noImgElement: 정적 export 라 next/image 최적화를 쓰지 않는다
        <img
          src={project.thumbnail}
          alt=""
          loading="lazy"
          className="aspect-video w-full rounded-sm object-cover"
        />
      )}
      <Heading className="text-body font-normal">
        <Link href={projectPath(project.slug)} className="underline-offset-4 group-hover:underline">
          {project.title}
        </Link>
      </Heading>
      <p className="flex-1 text-muted-foreground">{project.description}</p>
      <p className="text-caption tracking-caption text-muted-foreground">
        {formatPeriod(project.startDate, project.endDate)} · {project.role}
      </p>
      <TechStackList items={project.techStack} />
    </article>
  );
}
