import type { Project as VeliteProject } from '#site/content';
import type { Project, ProjectMeta, ProjectRepository } from './types';

/** Velite 가 빌드 시 content/projects 를 읽어 만든 데이터를 ProjectRepository 로 제공한다. */
export function createVeliteProjectRepository(source: VeliteProject[]): ProjectRepository {
  const published = source
    .filter((project) => !project.draft)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  return {
    async getAllProjects() {
      return published.map(toProjectMeta);
    },

    async getProjectBySlug(slug) {
      const project = published.find((entry) => entry.slug === slug);
      return project ? toProject(project) : null;
    },

    async getFeaturedProjects() {
      return published
        .filter((project) => project.featured)
        .sort(compareFeaturedOrder)
        .map(toProjectMeta);
    },
  };
}

/** featuredOrder 오름차순. featuredOrder 가 없으면 뒤로 (그 안에서는 시작일 최신순 유지) */
function compareFeaturedOrder(a: VeliteProject, b: VeliteProject): number {
  return (
    (a.featuredOrder ?? Number.POSITIVE_INFINITY) - (b.featuredOrder ?? Number.POSITIVE_INFINITY)
  );
}

function toProjectMeta(project: VeliteProject): ProjectMeta {
  return {
    slug: project.slug,
    title: project.title,
    description: project.description,
    startDate: project.startDate,
    endDate: project.endDate,
    role: project.role,
    techStack: project.techStack,
    links: project.links,
    thumbnail: project.thumbnail,
    featured: project.featured,
    featuredOrder: project.featuredOrder,
  };
}

function toProject(project: VeliteProject): Project {
  return { ...toProjectMeta(project), body: project.body, toc: project.toc };
}
