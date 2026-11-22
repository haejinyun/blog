import type { About as VeliteAbout } from '#site/content';
import type { AboutRepository } from './types';

/** Velite 가 빌드 시 content/about.mdx 를 읽어 만든 데이터를 AboutRepository 로 제공한다. */
export function createVeliteAboutRepository(source: VeliteAbout): AboutRepository {
  const about = {
    title: source.title,
    description: source.description,
    role: source.role,
    headline: source.headline,
    skills: source.skills,
    work: source.work,
    projects: source.projects,
    education: source.education,
    resumePdf: source.resumePdf,
    body: source.body,
  };

  return {
    async getAbout() {
      return about;
    },
  };
}
