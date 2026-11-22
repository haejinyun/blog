import type { Project } from '@/lib/content';
import { formatPeriod } from '@/lib/format-date';
import { TechStackList } from './tech-stack-list';

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-8">
      <h1 className="text-4xl leading-tight font-normal tracking-tight sm:text-heading">
        {project.title}
      </h1>
      <p className="text-muted-foreground sm:text-body">{project.description}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-muted-foreground">기간</dt>
        <dd>{formatPeriod(project.startDate, project.endDate)}</dd>
        <dt className="text-muted-foreground">역할</dt>
        <dd>{project.role}</dd>
        <dt className="text-muted-foreground">기술</dt>
        <dd>
          <TechStackList items={project.techStack} />
        </dd>
      </dl>
      {project.links.length > 0 && (
        <ul
          className="flex flex-wrap gap-4 text-caption tracking-caption uppercase"
          aria-label="프로젝트 링크"
        >
          {project.links.map((link) => (
            <li key={link.url}>
              <a href={link.url} className="underline underline-offset-4 hover:no-underline">
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
