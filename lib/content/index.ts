import { about, posts, projects, series } from '#site/content';
import { createVeliteAboutRepository } from './velite-about-repository';
import { createVelitePostRepository } from './velite-post-repository';
import { createVeliteProjectRepository } from './velite-project-repository';
import { createVeliteSeriesRepository } from './velite-series-repository';

export { type AdjacentPosts, findAdjacentPosts } from './adjacent-posts';
export type {
  About,
  AboutRepository,
  Post,
  PostMeta,
  PostRepository,
  Project,
  ProjectLink,
  ProjectMeta,
  ProjectRepository,
  ResumeEntry,
  Series,
  SeriesRepository,
  TocItem,
} from './types';

/** 페이지가 사용하는 콘텐츠 진입점. 구현체를 바꿀 때는 이 파일만 수정한다. */
export const postRepository = createVelitePostRepository(posts);
export const seriesRepository = createVeliteSeriesRepository(series);
export const projectRepository = createVeliteProjectRepository(projects);
export const aboutRepository = createVeliteAboutRepository(about);
