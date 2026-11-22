# 개인 블로그 SPEC

이 문서는 AI 에이전트가 구현할 때 따르는 기준 문서다. "결정 사항"에 적힌 것은 바꾸지 않는다. 문서에 없는 결정이 필요하면 임의로 정하지 말고 질문한다. "현재 범위"에 없는 작업은 하지 않는다.

## 1. 목표

- velog를 대체할 개인 블로그를 만든다. (블로그 + 포트폴리오 + 이력서를 한 사이트에서)
- 본문은 어떤 외부 서비스가 죽어도 열려야 한다. (정적 사이트)
- 사이트 자체가 FE 포트폴리오로 보여줄 수 있는 코드 품질을 갖는다.

## 2. 현재 범위

- 로컬에서 dev로 개발하고, build로 정적 파일(`out/`)을 만들어 Vercel에 배포한다. 배포는 사용자 요청으로 범위에 넣었다 (2026-11-22). 12장 참고
- 사이트 URL은 환경변수로 받는다. 배포 환경에서 코드를 고치지 않고 주소를 바꾸기 위해서다.
- velog 마이그레이션은 사용자 요청으로 범위에 넣었다 (2026-11-20). 11장 참고
- 댓글, 좋아요/조회수, 검색은 아직 범위가 아니다. 10장 참고

## 3. 비목표 (하지 않는 것)

- 자체 DB, 자체 인증, 자체 댓글 시스템
- 관리자 페이지 / 웹 에디터 (글은 로컬에서 마크다운으로 작성)
- ISR, 미들웨어, 요청 시점 서버 렌더링
- 다국어 (영어 버전 등)
- 모노레포, 블로그 외 다른 앱
- 자체 마크다운 파서 (기존 라이브러리 + remark/rehype 플러그인으로 해결)
- 배포 설정 파일(`vercel.json`), CI/CD 워크플로 작성. 배포는 Vercel Git 연동과 대시보드 설정으로 한다 (12장)

## 4. 결정 사항 (변경 금지)

| 항목 | 결정 |
| --- | --- |
| 프레임워크 | Next.js App Router, TypeScript strict |
| 렌더링 | 완전 정적 export (`output: 'export'`) |
| 콘텐츠 | 레포 내 `content/` 폴더의 `.mdx` 또는 `.md` 파일 (2026-11-20 사용자 결정으로 `.md` 추가). `.md`는 같은 MDX 컴파일러가 일반 마크다운으로 해석한다 (JSX·`{}` 해석 없음, HTML은 `rehype-raw`로 처리). 글 안에 컴포넌트가 필요하면 `.mdx` |
| MDX 처리 | **Velite** (Phase 1 선택). 빌드 시 frontmatter 스키마 검증(`--strict`)으로 빌드를 실패시킬 수 있고, 본문의 상대 경로 이미지를 `public/static/`으로 복사해 주기 때문 |
| 스타일 | Tailwind CSS v4 + `@tailwindcss/typography`. 색상 등 디자인 토큰은 `app/globals.css`에 모아 두고, 디자인 톤은 추후 디자인 문서로 교체 |
| 폰트 | Pretendard (Variable, `next/font/local`) |
| 패키지 매니저 | pnpm |
| Lint / Format | Biome |
| 테스트 | Playwright (빌드 결과물 e2e + 빌드 검증) |
| URL 형식 | `trailingSlash: false` (`/blog/<slug>`, 빌드 결과 `out/blog/<slug>.html`) |
| 사이트 URL | 환경변수 `NEXT_PUBLIC_SITE_URL`, 기본값 `http://localhost:3000`, 운영 `https://paori.dev` |
| 배포 | Vercel (`main`에 push하면 자동 배포), 도메인 `paori.dev` (2026-11-22 사용자 결정) |

### 스크립트

| 명령 | 역할 |
| --- | --- |
| `dev` | 개발 서버 (Velite watch 동시 실행) |
| `build` | 정적 파일을 `out/`에 생성 (`velite build --strict` → `next build`) |
| `preview` | `out/`을 로컬 정적 서버로 띄움 (`serve out`) |
| `lint` | 린트 + 타입 체크 (`biome check` + `tsc --noEmit`) |
| `format` | Biome 자동 수정 |
| `test` | 빌드 후 Playwright 테스트 |

## 5. 아키텍처 원칙

- 콘텐츠 소스는 Repository 인터페이스 뒤에 숨긴다. 페이지 컴포넌트는 파일 시스템이나 MDX 라이브러리를 직접 import하지 않는다.
- 페이지(`app/`)는 데이터 조회와 조합만 담당하고, UI는 컴포넌트로 분리한다.
- 함수는 하나의 역할만 하고, 이름만 보고 역할을 알 수 있어야 한다.
- 조건 분기는 얼리 리턴으로 처리한다.
- 사이트 URL, 작성자 정보 등 설정값은 `lib/config.ts` 한 곳에서만 관리한다.

### 콘텐츠 인터페이스

```ts
// lib/content/types.ts
export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;          // ISO 8601
  updated?: string;
  tags: string[];
  series?: string;
  seriesOrder?: number;
  thumbnail?: string;     // 대표(메인) 이미지. 글 상단과 목록에 보인다
  previewImage?: string;  // 목록 이미지: thumbnail, 없으면 본문 첫 이미지 (2026-11-20 추가, 사용자 요청)
  draft?: boolean;
}

export interface TocItem {
  title: string;
  url: string;           // '#heading-id'
  items: TocItem[];
}

export interface Post extends PostMeta {
  body: string;          // 컴파일된 MDX 또는 원문
  readingMinutes: number;
  toc: TocItem[];        // h2~h3 목차 (Phase 2 에서 추가, 승인됨)
}

export interface PostRepository {
  getAllPosts(): Promise<PostMeta[]>;               // draft 제외, 최신순
  getPostBySlug(slug: string): Promise<Post | null>;
  getPostsByTag(tag: string): Promise<PostMeta[]>;
  getPostsBySeries(series: string): Promise<PostMeta[]>; // seriesOrder 오름차순
  getAllTags(): Promise<{ tag: string; count: number }[]>;
}

export interface Series {
  slug: string;          // 파일명과 같음, PostMeta.series 값과 매칭
  title: string;
  description: string;
  body: string;          // 시리즈 소개 본문
}

export interface SeriesRepository {
  getAllSeries(): Promise<Series[]>;
  getSeriesBySlug(slug: string): Promise<Series | null>;
}

// Phase 4 에서 추가 (사용자 승인)
export interface ProjectMeta {
  slug: string;          // 폴더명
  title: string;
  description: string;
  startDate: string;     // 'YYYY-MM'
  endDate?: string;      // 없으면 진행 중
  role: string;
  techStack: string[];
  links: { label: string; url: string }[];
  thumbnail?: string;
  featured: boolean;     // 홈 대표 프로젝트
  featuredOrder?: number;
}

export interface Project extends ProjectMeta {
  body: string;
  toc: TocItem[];
}

export interface ProjectRepository {
  getAllProjects(): Promise<ProjectMeta[]>;      // draft 제외, 시작일 최신순
  getProjectBySlug(slug: string): Promise<Project | null>;
  getFeaturedProjects(): Promise<ProjectMeta[]>; // featured 만, featuredOrder 오름차순
}

// 2026-11-22 구조화 (사용자 승인): 이력 내용을 frontmatter 데이터로 두고 전용 컴포넌트로 그린다
export interface ResumeEntry {
  title: string;         // 회사·과정·학교 이름
  role?: string;
  startDate: string;     // 'YYYY-MM'
  endDate?: string;      // 없으면 진행 중
  summary?: string;
  team?: string;         // 팀 구성
  highlights: string[];
  techStack: string[];   // 항목 아래 한 줄. 없으면 숨김
  links: { label: string; url: string }[];  // 없으면 숨김
}

export interface About {
  title: string;
  description: string;
  role: string;          // 이름 위 직함
  headline: string;      // 이름 아래 한 줄 소개
  skills: string[];
  work: ResumeEntry[];
  projects: ResumeEntry[];  // Courses / Projects
  education: ResumeEntry[];
  resumePdf?: string;    // 없으면 PDF 다운로드 링크를 숨긴다
  body: string;          // Introduce 본문
}

export interface AboutRepository {
  getAbout(): Promise<About>;
}
```

### 콘텐츠 규칙

- slug는 폴더명이고 전체 글에서 유일해야 한다. URL은 `/blog/<slug>`이며 날짜를 포함하지 않는다.
- 날짜 폴더(YYYY/MM)는 파일 정리용일 뿐이다. 글 날짜는 항상 frontmatter의 `date`를 기준으로 한다.
- 날짜는 한국 시간(Asia/Seoul) 기준으로 표시한다. `date`에는 시각까지 넣을 수 있다 (같은 날 글의 순서를 유지하기 위해).
- 글의 이미지는 글 폴더 안에 두고 상대 경로(`./image.png`)로 참조한다.
- draft 글에서만 쓰는 이미지는 빌드 결과물에 복사하지 않는다.
- 작성 중인 글·프로젝트는 `content/drafts/`에서 쓴다. 이 폴더는 git에 올리지 않고(공개 레포에는 완성본만) 빌드에도 들어가지 않는다. 발행할 때 `content/posts/YYYY/MM/<slug>/` 또는 `content/projects/<slug>/`로 옮긴다 (2026-11-22 사용자 결정). frontmatter `draft: true`는 실수로 올라간 경우를 막는 안전장치로 유지한다.
- 글의 `series` 값은 `content/series/<slug>.md` 파일이 존재해야 한다. 없으면 빌드를 실패시킨다.
- slug가 중복되거나 필수 frontmatter가 빠져 있으면 빌드를 실패시킨다 (조용히 넘어가지 않는다).
- 프로젝트 필수 frontmatter: title, description, startDate(YYYY-MM), role, techStack. 공개 대표 프로젝트(`featured: true`)가 3개를 넘으면 빌드를 실패시킨다.
- `content/about.mdx`가 없으면 빌드를 실패시킨다. 연락처는 이메일만 공개하고 값은 `lib/config.ts`에서 가져온다.
- 이력 페이지에는 사진, 전화번호, 생년월일을 넣지 않는다 (2026-11-22 사용자 결정). 이름은 `lib/config.ts`의 작성자 이름을 쓴다.

frontmatter 예시

```yaml
---
title: "프론트엔드 개발자에서 프로덕트 개발자로 #1"
description: "한 줄 요약"
date: 2026-11-18
tags: [nextjs, architecture]
series: frontend-to-product
seriesOrder: 1
draft: false
---
```

시리즈 파일 예시 (`content/series/frontend-to-product.md`)

```yaml
---
title: "프론트엔드 개발자에서 프로덕트 개발자로"
description: "단독 FE로 리뉴얼 프로젝트를 이끈 기록"
---

시리즈 소개 본문 (마크다운)
```

### 폴더 구조

```
content/
  posts/
    2026/11/<slug>/index.mdx    # 글 + 같은 폴더에 이미지 (.md 도 가능)
  series/
    <slug>.md                   # 시리즈 소개
  projects/<slug>/index.mdx     # 포트폴리오
  about.mdx                     # 이력
  drafts/                       # 작성 중 (git 제외, 빌드 제외)
app/
  page.tsx                      # 홈
  blog/page.tsx
  blog/[slug]/page.tsx
  blog/[slug]/og.png/route.tsx  # 글별 OG 이미지 (빌드 시 생성)
  tags/[tag]/page.tsx
  series/page.tsx
  series/[slug]/page.tsx
  projects/page.tsx
  projects/[slug]/page.tsx
  about/page.tsx
  not-found.tsx
  sitemap.ts
  robots.ts
  rss.xml/route.ts              # force-static
  og.png/route.tsx              # 사이트 기본 OG 이미지
lib/
  config.ts                     # 사이트 URL, 작성자 등 설정
  content/                      # Repository 구현체
  routes.ts                     # 내부 경로 생성 함수 (링크, canonical, sitemap, RSS 공용)
  seo/                          # metadata, JSON-LD, RSS, OG 이미지 생성 함수
components/
```

## 6. 페이지 요구사항

| 경로 | 내용 |
| --- | --- |
| `/` | 짧은 소개, 최근 글 5개, 대표 프로젝트 2~3개 |
| `/blog` | 전체 글 목록 (제목, 설명, 날짜, 태그, 이미지가 있으면 미리보기 이미지 1개) |
| `/blog/[slug]` | 본문, 목차(TOC), 시리즈 내비게이션(이전/다음 편), 태그, 대표 이미지(thumbnail)가 있으면 글 상단에 표시 |
| `/tags/[tag]` | 태그별 글 목록 |
| `/series` | 시리즈 목록 (제목, 설명, 글 수, 마지막 업데이트). 공개 글이 있는 시리즈만. 상단 메뉴에 "Series" (Phase 2 이후 추가, 승인됨) |
| `/series/[slug]` | 시리즈 소개 + 순서대로 된 글 목록 |
| `/projects`, `/projects/[slug]` | 포트폴리오 케이스 스터디 |
| `/about` | 이력 웹 버전 + PDF 다운로드 링크 |

공개 금지 정보: 전화번호, 주소, 회사 내부 설정값(포트, 컨테이너명, 내부 URL)은 어떤 페이지에도 넣지 않는다.

## 7. SEO / 메타

- 모든 페이지에 `generateMetadata`로 title, description, canonical, OG 설정
- canonical, sitemap, RSS, OG의 절대 URL은 모두 `NEXT_PUBLIC_SITE_URL` 기준으로 만든다 (하드코딩 금지)
- 글 상세: JSON-LD BlogPosting + BreadcrumbList
- 홈/소개: JSON-LD Person
- sitemap.xml, robots.txt, rss.xml 빌드 시 생성
- OG 이미지: 빌드 시 글마다 생성 (요청 시점 생성 금지). `out/blog/<slug>/og.png`. 글 이외 페이지는 사이트 기본 이미지 `out/og.png`

## 8. 구현 단계

Phase 1(기반), 2(탐색), 3(SEO), 4(포트폴리오/이력)는 모두 끝났다 (2026-11-20). 각 Phase의 완료 조건은 `tests/`의 빌드 검증과 e2e 테스트로 계속 확인하고, 진행 이력은 `docs/PROGRESS.md`에 있다.

## 9. 미정 사항 (에이전트가 임의 결정 금지)

지금은 없다. 스타일링(Tailwind CSS v4), 폰트(Pretendard), 패키지 매니저(pnpm)는 4장, 디자인 톤은 `docs/DESIGN.md`로 정해졌다. 새로 생기면 여기에 적는다.

## 10. 다음 단계 (아직 범위 아님, 구현하지 않음)

| 작업 | 메모 |
| --- | --- |
| 댓글 | giscus (GitHub Discussions). 공개 레포와 Discussions 설정이 필요해서 배포 후 진행. 스크립트 로드가 실패해도 본문은 정상 렌더링 |
| 좋아요/조회수 | ReactionRepository 인터페이스 + 서버리스 KV (Upstash / Cloudflare) |
| 검색 | 빌드 시 인덱스 생성 |

## 11. velog 마이그레이션 (2026-11-20 범위 추가)

- `pnpm import:velog --username <아이디> --series <시리즈 slug>`로 시리즈 하나를, `--post <글 slug>`로 시리즈에 속하지 않은 글 하나를 가져온다 (`scripts/import-velog.ts`, `--post`는 2026-11-23 추가).
- velog 공개 GraphQL API(`https://v2.velog.io/graphql`)를 읽기만 한다. 로그인 토큰을 쓰지 않으므로 비공개 글은 가져오지 않는다.
- 글은 `content/posts/YYYY/MM/<velog url_slug>/index.md`로 저장한다. 날짜 폴더는 `released_at`의 한국 시간 기준이다.
- 본문과 썸네일 이미지는 내려받아 글 폴더에 저장하고 본문은 상대 경로(`./image-1.png`)로 바꾼다. 빌드하면 다른 글 이미지처럼 `public/static/`으로 복사된다.
- 시리즈는 `content/series/<시리즈 slug>.md`로 만든다. velog 시리즈 설명이 비어 있으면 시리즈 이름을 설명으로 쓴다.
- 재실행해도 안전해야 한다. 이미 있는 글과 시리즈 파일은 건너뛰어 로컬에서 고친 내용을 지키고, `--force`를 줄 때만 덮어쓴다.
- frontmatter 대응: title ← `title`, description ← `short_description`, date ← `released_at`, updated ← `updated_at` (한국 시간 날짜가 다를 때만), tags ← `tags`, series·seriesOrder ← 시리즈와 순서, thumbnail ← `thumbnail`

## 12. 배포 (2026-11-22 범위 추가)

- 호스팅은 Vercel. GitHub `haejinyun/blog`의 `main`에 push하면 자동으로 배포된다.
- Vercel 설정 (설정 파일 없이 대시보드에서 관리)
  - Framework Preset: Next.js. 정적 export(`out/`)와 `/blog/foo` → `foo.html` 연결을 자동으로 처리한다. Output Directory는 기본값 그대로 둔다
  - Build Command: `pnpm build` (Override 필수. `next build`만 실행하면 Velite가 돌지 않아 빌드가 실패한다)
  - 환경 변수: `NEXT_PUBLIC_SITE_URL=https://paori.dev`, `ENABLE_EXPERIMENTAL_COREPACK=1` (`package.json`의 pnpm 버전을 그대로 쓰기 위해)
- 도메인은 `paori.dev`(가비아). 네임서버는 가비아를 쓰고 A(`@`)와 CNAME(`www`) 레코드로 Vercel에 연결한다.
- 대표 주소는 `https://paori.dev`. `www`, `http`, `vercel.app` 주소는 308로 대표 주소에 리다이렉트한다. HTTPS 인증서는 Vercel이 자동으로 발급·갱신한다.
- 검색 등록: Google Search Console은 도메인 속성(DNS TXT 인증), 네이버 서치어드바이저는 메타 태그 인증(`lib/config.ts`의 `searchVerification`). 둘 다 `sitemap.xml`을 제출한다.
