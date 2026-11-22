export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO 8601
  updated?: string;
  tags: string[];
  series?: string;
  seriesOrder?: number;
  thumbnail?: string; // 대표(메인) 이미지. 글 상단과 목록에 보인다
  previewImage?: string; // 목록에 보일 이미지: thumbnail, 없으면 본문 첫 이미지 (Phase 이후 추가, 승인됨)
  draft?: boolean;
}

export interface TocItem {
  title: string;
  url: string; // '#heading-id'
  items: TocItem[];
}

export interface Post extends PostMeta {
  body: string; // 컴파일된 MDX (function-body 형식)
  readingMinutes: number;
  toc: TocItem[]; // h2~h3 목차
}

export interface PostRepository {
  getAllPosts(): Promise<PostMeta[]>; // draft 제외, 최신순
  getPostBySlug(slug: string): Promise<Post | null>;
  getPostsByTag(tag: string): Promise<PostMeta[]>;
  getPostsBySeries(series: string): Promise<PostMeta[]>; // seriesOrder 오름차순
  getAllTags(): Promise<{ tag: string; count: number }[]>;
}

export interface Series {
  slug: string; // 파일명과 같음, PostMeta.series 값과 매칭
  title: string;
  description: string;
  body: string; // 시리즈 소개 본문 (컴파일된 MDX)
}

export interface SeriesRepository {
  getAllSeries(): Promise<Series[]>;
  getSeriesBySlug(slug: string): Promise<Series | null>;
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface ProjectMeta {
  slug: string;
  title: string;
  description: string;
  startDate: string; // 'YYYY-MM'
  endDate?: string; // 없으면 진행 중
  role: string;
  techStack: string[];
  links: ProjectLink[];
  thumbnail?: string;
  featured: boolean;
  featuredOrder?: number;
}

export interface Project extends ProjectMeta {
  body: string;
  toc: TocItem[];
}

export interface ProjectRepository {
  getAllProjects(): Promise<ProjectMeta[]>; // draft 제외, 시작일 최신순
  getProjectBySlug(slug: string): Promise<Project | null>;
  getFeaturedProjects(): Promise<ProjectMeta[]>; // featured 만, featuredOrder 오름차순
}

export interface About {
  title: string;
  description: string;
  updated: string; // ISO 8601, 이력 최종 수정일
  resumePdf?: string; // 이력서 PDF 경로. 없으면 다운로드 링크를 숨긴다
  body: string;
}

export interface AboutRepository {
  getAbout(): Promise<About>;
}
