# 진행 기록

문맥이 끊겨도 이어서 작업할 수 있도록 진행 상황, 결정 이유, 개발 중 겪은 문제를 기록한다.
요구사항과 확정된 결정의 기준은 `docs/SPEC.md`이고, 이 문서는 "어디까지 했고 왜 그렇게 했는지"를 남긴다.

**갱신 규칙**: 작업 단위(Phase, 추가 기능, 중요한 결정)가 끝날 때마다 "현재 상태", "작업 이력", "다음 할 일"을 갱신한다. 새 결정은 "결정 기록"에 날짜와 이유를 함께 적는다.

---

## 현재 상태 (2026-11-22 기준, `https://paori.dev` 배포 완료)

- SPEC 8장의 Phase 1~4 완료, velog 마이그레이션 1차(시리즈 1개, 7편) 완료, Vercel 배포와 도메인 연결 완료
- 테스트: `pnpm test` 103개 통과, 15개 skip (draft 대상 없음 10개, Projects·About 숨김 5개) / `pnpm lint` 통과
- git: GitHub `haejinyun/blog`(공개)의 `main`. push하면 Vercel이 자동 배포한다. **커밋은 사용자가 요청할 때만** 한다
- 커밋 대기 중인 변경: README 영어 버전, 네이버 인증 메타 태그, SPEC·PROGRESS 정리, 사이트 이름 `paori`, 글자 크기 축소, 푸터 파오리 이스터에그

## 작업 재개 방법

```bash
pnpm install
pnpm dev        # http://localhost:3000 (Velite watch 동시 실행)
pnpm lint       # Biome + 콘텐츠 빌드 + tsc
pnpm test       # 빌드 → Playwright (build 검증 + e2e)
pnpm build && pnpm preview   # 정적 결과물 확인
```

---

## 다음 할 일

### velog 마이그레이션 (1차 완료, 사용자 확인 대기)
- [ ] 가져온 7편 확인 (`pnpm dev` 또는 `pnpm build && pnpm preview`)
- [ ] 태그: velog 글에 태그가 없어서 7편 모두 `tags: []`. 태그를 달지 정하기 (지금은 `/tags/*` 페이지가 없음)
- [ ] 3편 description은 velog 자동 요약(150자에서 잘림, 문장 사이 공백 없음)이라 직접 다듬기
- [ ] 시리즈 설명: velog에 비어 있어서 시리즈 이름을 그대로 넣음 (`content/series/frontend-to-product-developer.md`)
- [ ] 샘플 글을 지우면서 draft 글 테스트(목록·빌드 결과물·이미지 제외) 3개, draft 태그 404, 태그 클릭 테스트가 skip됨. 대상 콘텐츠가 생기면 다시 실행됨. 커버리지를 유지할지 사용자와 정하기
- [ ] 나머지 velog 글 가져오기 (시리즈별로 `pnpm import:velog --username haejinyun --series <slug>`. 시리즈에 속하지 않은 글은 스크립트가 아직 지원하지 않음)

### 배포 후 남은 일
- [ ] `<프로젝트>.vercel.app` 주소도 `paori.dev`로 308 리다이렉트 (Vercel Domains → Edit)
- [ ] Google Search Console: 도메인 속성으로 `paori.dev` 등록, 가비아 DNS에 TXT 레코드(`@`) 추가 후 인증, `https://paori.dev/sitemap.xml` 제출
- [ ] 네이버 서치어드바이저: 메타 태그를 넣은 커밋을 배포한 뒤 소유 확인, sitemap과 RSS(`/rss.xml`) 제출
- [ ] 한글 slug 글이 생기면 배포 사이트에서 열리는지 확인

### 사용자가 채울 콘텐츠
- [ ] Projects·About 다시 열기: 콘텐츠를 채운 뒤 `[숨김]`으로 검색해서 `app/page.tsx`, `components/layout/site-header.tsx` 주석과 `tests/e2e`의 `test.skip`을 되돌리기. 메뉴가 4개로 늘면 360px 화면 넘침 테스트(`tests/e2e/header.spec.ts`)를 꼭 확인 (모바일 메뉴 간격 `gap-1`)
- [ ] `content/projects/*`: placeholder 프로젝트를 실제 케이스 스터디로 교체 (`sample-*` 폴더는 삭제)
- [ ] `content/about.mdx`: 실제 이력. PDF가 생기면 `content/`에 두고 frontmatter `resumePdf: ./resume.pdf` (Velite `s.file()`이 `public/static/`으로 복사)
- [ ] 홈 소개 문구 (`app/page.tsx`의 placeholder 문단)
- [ ] `.forbidden-strings.local`에 금지 문자열 적기 (사용자가 나중에 하기로 함, 2026-11-22). 대상: 회사명(한글·영문·약칭), 클라우드 이름, 레포 이름, API·내부 도메인, 서버 스택·서버 이름, IP, 집 주소, 전화번호. 완전히 같은 문자열(대소문자 포함)로 비교하므로 주소는 겹치지 않는 일부를 적는다
- [ ] (제안) 금지 정보 검사 보강: 사설 IP·내부 도메인 형태·`호스트:포트` 정규식 추가, 검사 범위를 빌드 결과물에서 커밋 대상 원본 파일까지 넓히기

### 디자인 (1차 적용 완료, 기준: `docs/DESIGN.md`)
- [ ] 코드 하이라이팅(Shiki), 인라인 코드 백틱

디자인을 바꿀 때 손댈 곳:
- 색상·폰트 토큰: `app/globals.css` (`:root` 변수 + `@theme inline`, 간격·모서리·라벨은 `@theme`)
- 본문(MDX/마크다운) 스타일: `components/mdx/mdx-article.tsx`의 `prose` 클래스, 태그별 컴포넌트 연결은 `components/mdx/mdx-content.tsx`
- 레이아웃: `app/layout.tsx`(본문 폭 `max-w-3xl`), `components/layout/*`(헤더 로고 28px, 메뉴, 푸터)
- 목록·카드: `components/post/post-list-item.tsx`(미리보기 이미지), `components/project/project-list.tsx`, `components/series/*`, `components/home/home-section.tsx`
- 글 상단 대표 이미지: `components/post/post-cover-image.tsx`, 목차: `components/post/table-of-contents.tsx` + `components/mdx/article-with-toc.tsx`
- OG 이미지: `lib/seo/og-image.tsx`의 `COLORS` (globals.css 팔레트와 같은 값)
- 같이 처리할 것: 코드 하이라이팅(Shiki, 테마는 디자인과 함께), 인라인 코드에 백틱이 보이는 typography 기본 스타일
- 디자인을 바꾼 뒤 e2e 테스트가 역할·텍스트 기준으로 찾으므로(`main article h2` 등) 구조를 바꾸면 테스트도 같이 확인

### 사용자에게 물어본 뒤 답을 못 받은 것
- [ ] OG 이미지를 글 대표 이미지(thumbnail)로 바꿀지 (지금은 SPEC대로 빌드 시 생성한 카드)
- [ ] dev 서버와 build/test의 `.velite` 출력 폴더 분리 여부 (build·test가 `--clean`으로 `.velite`를 지우는 순간 dev 화면에 "Module not found"가 잠깐 뜸. 새로고침하면 복구)
- [ ] draft·태그 테스트 커버리지 유지 방법. draft가 git에서 빠져서(`content/drafts/`) 새로 clone한 환경에서는 draft 테스트가 항상 skip됨. 추천: draft 테스트를 `buildFixture`(임시 픽스처 빌드) 방식으로 바꾸기

---

## 결정 기록

| 날짜 | 결정 | 이유 / 맥락 |
| --- | --- | --- |
| 2026-11-19 | 패키지 매니저 pnpm, 스타일 Tailwind v4, lint/format Biome | 사용자 결정 |
| 2026-11-19 | 디자인은 일단 에이전트 재량 | 사용자가 나중에 디자인 문서로 일괄 수정 예정 |
| 2026-11-19 | 폰트 Pretendard (OG 이미지 포함) | 사용자 결정 |
| 2026-11-19 | `trailingSlash: false` | 사용자가 URL 끝에 `/`가 없는 형태를 원함. Vercel, Cloudflare Pages, Netlify, GitHub Pages는 `/blog/foo` → `foo.html`을 자동 처리. S3나 기본 nginx로 옮기면 rewrite 설정이 필요함 |
| 2026-11-19 | 검증은 빌드 성공 + Playwright | 사용자 요청. 빌드 실패 조건은 Playwright 러너에서 임시 픽스처로 빌드해서 확인 |
| 2026-11-19 | 작성자 정보: 윤해진 / haejinlog(임시) / 안녕하세요, 윤해진입니다. / dbshaejin@gmail.com / github.com/haejinyun | 사용자 제공. `lib/config.ts`에만 둠 |
| 2026-11-19 | Phase 4 콘텐츠는 placeholder | 사용자가 나중에 직접 작성 |
| 2026-11-19 | MDX 처리: Velite | 스키마 검증으로 빌드 실패 가능, 상대 경로 이미지 자동 복사 |
| 2026-11-19 | TypeScript 6.0.3 고정 | 최신 7.x는 Go 포트라 Next.js 타입 체크 호환 미확인 |
| 2026-11-19 | `Post`에 `toc: TocItem[]` 추가 | TOC 구현에 필요. 스펙 인터페이스 확장이라 사용자 승인 받음 |
| 2026-11-19 | draft 전용 이미지는 빌드 결과물에서 제외 | 사용자 요청 |
| 2026-11-19 | `/series` 목록 페이지 + 상단 메뉴 "Series" (A안) | 시리즈 진입 경로가 없다는 사용자 피드백. B안(`/blog` 탭), C안(홈 섹션)도 검토했으나 사용자가 A 선택. 태그 목록(`/tags`)은 만들지 않음 |
| 2026-11-19 | 테스트 기대값은 샘플 slug를 하드코딩하지 않고 `.velite/*.json`에서 계산 | velog 마이그레이션 후에도 테스트를 고치지 않기 위해 |
| 2026-11-20 | OG 이미지를 `opengraph-image` 파일 규칙 대신 `og.png/route.tsx`(force-static)로 생성 | 파일 규칙은 확장자 없는 파일을 만들어 정적 서버에서 Content-Type이 빠짐. 또 페이지가 `openGraph`를 지정하면 루트 이미지가 상속되지 않음 |
| 2026-11-20 | 글 이외 페이지에도 사이트 기본 OG 이미지(`/og.png`) 사용 | SPEC은 글별 이미지만 요구하지만, 공유 시 빈 미리보기를 막기 위해 추가 (에이전트 판단, 영향 작음) |
| 2026-11-20 | sitemap에 홈, `/blog`, `/series`, 글, 공개 글이 있는 시리즈, 태그 페이지 포함 | 공개 경로 전체를 알림. draft와 빈 시리즈는 제외 |
| 2026-11-20 | 내부 경로는 `lib/routes.ts`(`postPath`, `tagPath`, `seriesPath`)에서만 만든다 | 링크, canonical, sitemap, RSS가 같은 경로(인코딩 포함)를 쓰게 하기 위해 |
| 2026-11-20 | RSS는 의존성 없이 직접 XML 문자열 생성 (`lib/seo/rss.ts`, 모든 값 `escapeXml`) | 형식이 단순하고 의존성을 늘리지 않기 위해 |
| 2026-11-20 | Project/About 스키마와 Repository 인터페이스 (SPEC 5장에 기록) | 에이전트 초안을 사용자가 승인 |
| 2026-11-20 | 대표 프로젝트는 `featured: true` + `featuredOrder`. 공개 대표 프로젝트가 3개를 넘으면 빌드 실패 | SPEC "대표 프로젝트 2~3개". 조용히 넘어가지 않는 원칙 |
| 2026-11-20 | 이력서 PDF는 `resumePdf`가 없으면 링크를 숨김 | 아직 PDF가 없음. 사용자 승인 |
| 2026-11-20 | 연락처는 이메일만. 전화번호·주소는 어디에도 쓰지 않음 | 사용자 요청 |
| 2026-11-20 | `lint`에 `next typegen` 추가 | typed routes 타입이 `next build` 때만 생겨서, 새 경로를 추가하면 빌드 전 lint가 실패했음 |
| 2026-11-20 | 글·프로젝트 상세의 본문+목차 레이아웃을 `ArticleWithToc`로 공용화. 목차가 없으면 목차 박스를 그리지 않음 | 기존에는 소제목 없는 글에 빈 테두리 박스가 보였음 |
| 2026-11-20 | 콘텐츠 형식에 `.md` 추가 (SPEC 4장 결정 변경, 사용자 승인 A안) | velog 원문은 일반 마크다운이라 MDX로 읽으면 `{}`, `<`, `<br>`에서 깨질 수 있음. 변환 규칙을 만들면 사실상 자체 파서가 되어 SPEC 비목표에 걸림. 같은 MDX 컴파일러의 `format: 'detect'`로 .md는 마크다운 모드, HTML은 `rehype-raw` |
| 2026-11-20 | velog 마이그레이션을 범위에 넣음, 1차는 시리즈 1개 | 사용자 요청. SPEC 11장 |
| 2026-11-20 | velog slug를 그대로 씀, description은 `short_description`, 시리즈 설명이 비면 이름 | 사용자가 추천안 승인 |
| 2026-11-20 | 가져오기는 이미 있는 파일을 건너뛰고 `--force`일 때만 덮어씀 | 가져온 뒤 로컬에서 고친 내용(태그, 설명 등)을 지키기 위해 |
| 2026-11-20 | 날짜는 한국 시간으로 표시 (`siteConfig.timeZone`), velog 글은 `date`에 시각까지 | velog `released_at`은 UTC라 새벽 글이 하루 전 날짜로 보였음. 같은 날 글의 순서도 유지 |
| 2026-11-20 | 읽는 시간을 직접 계산 (`estimateReadingMinutes`, 한글 분당 500자) | Velite `s.metadata()`가 한글을 세지 않아 모든 한국어 글이 1분이었음 |
| 2026-11-20 | 동적 경로 값이 0개면 `__empty__` placeholder 경로 하나를 만들어 404로 렌더 (`toStaticParams`) | `output: 'export'`는 generateStaticParams가 빈 배열이면 빌드 실패. 태그 없는 글만 있을 때 실제로 발생. placeholder는 noindex 404이고 링크·sitemap에 없음 |
| 2026-11-20 | 하드코딩 도메인 검사를 `<link>`·`<meta>`·JSON-LD·sitemap·RSS·robots로 한정 | 가져온 글 본문(코드 예시 `http://localhost:X000`, 외부 링크)은 콘텐츠라서 |
| 2026-11-20 | 대표 이미지(thumbnail)를 글 상단에 표시, 목록에 미리보기 이미지(thumbnail, 없으면 본문 첫 이미지) | 사용자 요청. velog 썸네일(메인 이미지)은 가져오기 때 이미 thumbnail로 저장되고 있었음. `PostMeta.previewImage` 추가 |
| 2026-11-20 | OG 이미지는 그대로 빌드 시 생성한 이미지 사용 (대표 이미지로 바꾸지 않음) | SPEC 7장 "OG 이미지: 빌드 시 글마다 생성"이 결정 사항이라. 바꿀지는 사용자에게 확인 |
| 2026-11-20 | 파비콘은 사용자 제공 PNG(1024px)로 만듦: `app/favicon.ico`(16·32·48), `app/icon.png`(192), `app/apple-icon.png`(180) | 같이 받은 SVG는 픽셀을 1px 사각형 수천 개로 옮긴 1.2MB 파일이라 벡터 장점이 없음. 원본(데스크톱)은 그대로 두고 복사본을 리사이즈. 원본 배경이 검정이라 복사본에서 배경만 투명하게 바꿈 (사용자 요청) |
| 2026-11-20 | 공개 금지 정보 검증: 전화번호는 정규식, 주소·회사 내부 설정값은 git 제외 파일 `.forbidden-strings.local`(한 줄에 하나)로 검사. 파일이 없으면 그 검사는 skip | 주소·내부값은 일반 규칙으로 못 잡음. 금지 목록 자체가 민감 정보라 레포에 올리지 않음 |
| 2026-11-20 | 디자인: Telescope 스타일(`docs/DESIGN.md`)의 색상·테두리·2px 모서리·간격·글자 크기 적용. 요소 배치와 섹션 순서는 유지 | 사용자 결정. 적용 규칙은 `docs/DESIGN.md`, 원문은 로컬 전용 `docs/DESIGN.reference.local.md` |
| 2026-11-20 | 보조 글자색을 `#82868e` → `#686c73`으로 진하게 | 원본은 바탕 대비 3.3:1로 WCAG AA(4.5:1) 미달. 바꾼 값은 바탕 4.75:1, 흰색 5.27:1. 에이전트 제안, 사용자 승인 |
| 2026-11-20 | 글자: 굵기 400 하나, 크기 12(라벨)·19(본문)·23(목록 제목·소제목·요약)·55/57px(제목). 행간은 한글 때문에 넓힘(제목 1.15, 본문 1.6, 글 본문 1.75). 모바일은 제목 36px, 요약 19px | 디자인 문서 타입 스케일. 에이전트 제안, 사용자 승인. 글 본문 안 `strong`은 굵게 유지 |
| 2026-11-20 | 폰트는 Pretendard 하나 (디자인 문서의 Beausite·DM Mono·CM Geom 안 씀) | 사용자 결정. Beausite에 한글이 없고 SPEC 결정 사항 |
| 2026-11-20 | 상단 헤더 유지 (디자인 문서의 하단 고정 바 안 씀), 메뉴는 12px 대문자 라벨 | 사용자 결정 |
| 2026-11-20 | 라이트 테마만 (다크 모드 제거) | 사용자 결정. 디자인 문서가 라이트 테마만 정의 |
| 2026-11-20 | 강조색 라임(`#e3f794`)은 현재 메뉴 배경에만 (`NavigationLink`, `aria-current="page"`). 링크 hover는 밑줄 | 사용자 결정. 디자인 문서가 라임을 한 곳에만 쓰라고 함. 라임 글자는 바탕 위에서 안 보여서 글자색으로 쓰지 않음 |
| 2026-11-20 | 헤더를 상단 고정(`sticky top-0`), 맨 오른쪽(메뉴 뒤)에 GitHub 아이콘 링크(새 탭), 글 상세에만 "맨 위로" 버튼(600px 이상 스크롤하면 표시, 오른쪽 아래) | 사용자 요청. 아이콘은 의존성 없이 인라인 SVG(`components/icons/github-icon.tsx`). 고정 헤더에 가리지 않게 목차 sticky 위치를 `top-24`로 내림. 360px 화면에서 헤더가 넘치지 않게 모바일 간격을 줄임 (테스트로 확인) |
| 2026-11-20 | 목차에서 지금 읽는 섹션을 강조 (검정 글자 + 왼쪽 2px 검정 선, `aria-current="location"`). 화면 위 120px 안으로 지나간 마지막 소제목, 페이지 끝이면 마지막 소제목 | 사용자 제안. 라임은 현재 메뉴 전용이라 쓰지 않음. 스크롤 이벤트 + requestAnimationFrame (IntersectionObserver보다 "마지막으로 지나간 소제목" 계산이 단순) |
| 2026-11-22 | 배포는 Vercel, 도메인 `paori.dev`(가비아), 대표 주소는 www 없는 루트 도메인 | 사용자 결정. 정적 export와 `trailingSlash: false`(`/blog/foo` → `foo.html`)를 추가 설정 없이 지원. SPEC 2·3·4·12장에 반영 |
| 2026-11-22 | 검색 등록: Google은 도메인 속성(DNS TXT), 네이버는 메타 태그(`siteConfig.searchVerification.naver` → 루트 layout `verification.other`) | Google 도메인 속성은 코드 수정 없이 www·http까지 포함. 네이버는 도메인 속성이 없음. 인증 값은 비밀 정보가 아니라 레포에 둠 |
| 2026-11-22 | 사이트 이름 `paori` (본명은 글쓴이 정보로: 푸터, About, JSON-LD, 홈 첫 문장 "안녕하세요, 윤해진입니다."는 유지) | 사용자 결정. 도메인 `paori.dev`, 로고, SNS 이름과 맞춤. 레포 이름(`blog`)과 `package.json` name은 그대로 |
| 2026-11-22 | 글자 크기 축소: 본문 19→16, 목록 제목·요약 23→18, 제목 55·57→38·40, 모바일 제목 36→28(`heading-sm` 토큰 추가), 라벨 12 유지. 자간은 em으로 | 사용자 요청("전체적으로 30% 정도 줄이기"). 본문은 한글 가독성 때문에 16px 하한 |
| 2026-11-22 | 푸터 저작권 옆 파오리 아이콘(16px, 픽셀 렌더링)을 누르면 이스터에그 모달 (`components/layout/paori-easter-egg.tsx`, 네이티브 `<dialog>`) | 사용자 요청. `<dialog>`라 Esc 닫기·포커스 처리가 기본 제공. 배경 클릭으로도 닫힘. 내용은 사용자가 쓴 편지(포켓몬 이야기). 한글이 단어 중간에서 끊기지 않게 `break-keep`. README 끝에도 `<details>`로 접힌 이스터에그 한 줄 |
| 2026-11-22 | README는 영어로 짧게 (소개 한 줄 + Development + Deployment + Tech Stack + Author) | 사용자 결정. 참고: github.com/yceffort/blog |
| 2026-11-22 | Projects·About을 콘텐츠 준비 전까지 숨김: 상단 메뉴 항목과 홈 대표 프로젝트 섹션을 코드 주석으로 막음(`[숨김]` 표시). 관련 테스트 5개 `test.skip` | 사용자 결정(설정값 방식 대신 주석). 페이지(`/projects`, `/about`)는 빌드되고 sitemap에도 남아 있어 주소로는 접근 가능 |
| 2026-11-22 | 작성 중인 글·프로젝트는 `content/drafts/`(git 제외)에서 쓰고 발행할 때 옮김. placeholder `draft-sample-project`는 `content/drafts/projects/`로 이동 | 사용자 결정: 공개 레포에는 화면에 보일 완성본만. 경로로 구분해야 `.gitignore`가 동작함. 폴더 이름 접두어 방식은 `draft` 값과 어긋나면 완성 글이 git에서 빠질 수 있어서 피함. 단점: draft는 백업이 없음 |
| 2026-11-22 | 디자인 레퍼런스 원문은 git에서 제외(`docs/*.local.md`), 공개용 `docs/DESIGN.md`는 직접 쓴 적용 규칙 요약 | 공개 레포에 외부 글을 통째로 올리지 않기 위해 (저작권). 비상업 사용이어도 허락 없는 전문 공개는 피함. 사용자 결정 |
| 2026-11-20 | 디자인 문서의 숫자 간격 토큰(`--spacing-6: 6px` 등)은 가져오지 않고 `section`(56px)·`card`(14px)·`element`(10px)로 정함 | 숫자 토큰은 Tailwind 기본 눈금(`p-6` = 24px)을 덮어씀. 범위 값(48-71px)은 CSS 값이 아니라서 범위 안의 값 하나로 |

---

## 개발 중 겪은 문제와 해결

### Velite CLI가 설정 파일의 `strict: true`를 무시함
- 증상: 필수 frontmatter가 빠져도 경고만 찍고 exit 0
- 원인: CLI가 `strict` 기본값 `false`를 넘기고, 내부에서 `options.strict ?? config.strict`로 처리
- 해결: 빌드 스크립트에 `velite build --strict`를 명시. 설정 파일의 `strict: true`는 dev(next.config에서 프로그래밍 방식으로 호출)용

### Next dev 서버에서 한글 파라미터가 500
- 증상: `/tags/회고`가 정적 빌드와 preview에서는 200, dev에서만 500 ("missing param in generateStaticParams")
- 원인: `next-dev-server.js`가 퍼센트 인코딩된 요청 경로와 `generateStaticParams` 결과(원래 값)를 문자열 그대로 비교
- 해결: `lib/route-params.ts`. dev에서만 인코딩된 값도 함께 반환하고(`toStaticParamValues`), 페이지에서는 `decodeParam`으로 원래 값으로 되돌림. **새 동적 경로를 만들 때도 같은 방식을 쓴다.** velog 글은 한글 slug가 많아서 중요함
- 검증: 한글 slug 임시 글로 dev와 preview 모두 200 확인 후 삭제

### Playwright가 webServer보다 테스트 파일을 먼저 읽음
- 증상: 테스트 수집 시점에 `.velite`가 없으면 실패
- 해결: `test` 스크립트를 `pnpm build && playwright test`로 바꾸고, webServer는 preview만 실행

### 빌드 실패 테스트가 병렬 실행에서 간헐적으로 실패
- 원인: `afterAll`이 공용 임시 폴더 전체를 지움. 병렬 워커마다 `afterAll`이 돌아서 다른 워커의 픽스처를 지움
- 해결: 각 테스트가 자기 픽스처 폴더만 만들고 `finally`에서 지움 (`buildFixture`)

### draft 이미지 차단 방식
- Velite는 `prepare` 훅이 끝난 **뒤에** 전역 `assets` 맵을 보고 파일을 복사함
- `prepare`에서 draft 글만 참조하는 에셋을 `assets` 맵에서 삭제 (공개 글과 같이 쓰는 이미지는 유지)

### OG 이미지 (`next/og`)
- `next/og`(Satori)는 woff2를 읽지 못함 → OG 이미지에는 `pretendard/dist/public/static/*.otf` 사용
- `opengraph-image.tsx` 규칙은 `out/blog/<slug>/opengraph-image`처럼 **확장자 없는 파일**을 만들고, `serve`가 Content-Type 없이 응답함 (호스팅에서도 같을 수 있음)
- 또 페이지 metadata가 `openGraph`를 지정하면 shallow merge 때문에 루트 `opengraph-image`가 일반 페이지에 붙지 않음
- 해결: `app/blog/[slug]/og.png/route.tsx`, `app/og.png/route.tsx` route handler(`dynamic = 'force-static'`)로 만들고 `lib/seo/metadata.ts`에서 이미지 URL을 명시
- `output: 'export'`에서 metadata 이미지 route나 route handler는 `export const dynamic = 'force-static'`이 없으면 빌드 실패

### 사이트 URL을 바꾼 빌드 검증
- `out/`을 덮어쓰면 병렬로 도는 e2e가 깨짐 → `EXPORT_OUT_DIR` 환경변수로 다른 폴더에 export (`next.config.ts`의 `distDir`)
- `output: 'export'`에서 `distDir`을 지정하면 **export 위치만** 바뀌고 빌드 산출물은 `.next`에 남음 (`next/dist/export/utils.js`의 `getBuildDistDir`)
- 테스트는 `mode: 'serial'`. 병렬이면 워커마다 `beforeAll`이 돌아 빌드가 동시에 여러 번 실행됨
- 홈 canonical은 `trailingSlash: false` 때문에 Next가 끝의 `/`를 뗀다 (`http://host`). sitemap과 RSS는 `http://host/`. 둘 다 같은 주소라 그대로 둠

### Vercel에서 `Can't resolve '#site/content'`로 빌드 실패
- 원인: Vercel Build Command가 `next build`라서 Velite가 실행되지 않음. `#site/content`는 `.velite`(git 제외, Velite 생성물)를 가리킴. 로컬은 예전에 만든 `.velite`가 남아 있어서 성공했음 (`.velite`를 지우고 `next build`로 재현 확인)
- 해결: Vercel Build Command를 `pnpm build`로 Override (Velite → next build 순서)

### velog 가져오기
- 공개 API `https://v2.velog.io/graphql`은 로그인 없이 공개 글을 읽을 수 있음 (v3 주소는 응답 없음). `series(username, url_slug)`, `post(username, url_slug)` 쿼리 사용
- velog 이미지는 `velog.velcdn.com`. 내려받아 글 폴더에 `image-N.ext`, `thumbnail.ext`로 저장하고 본문은 `./image-N.ext`로 바꿈 → Velite가 `public/static/`으로 복사
- 가져온 썸네일 중 SVG가 있어서 Biome이 lint함 → `content/**/*.svg`를 Biome 대상에서 제외
- 가져오기 전에 본문에서 포트, IP, URL, 컨테이너명, 전화번호 패턴을 검사함. 1차 7편은 사용자가 이미 `X000`, `XXXXX`, `example.com`으로 가려 둬서 문제 없었음. **다음 시리즈도 가져온 뒤 같은 검사를 한다**

### 파비콘
- Next(Turbopack)는 `favicon.ico` 안의 PNG가 RGBA가 아니면 빌드 실패 ("The PNG is not in RGBA format"). macOS `sips`로 줄인 PNG는 RGB라서, 의존성으로 이미 설치된 sharp의 `ensureAlpha()`로 변환함 (package.json에는 추가하지 않음)

- 배경 투명화: 검정(채널 최댓값 15 이하) 중 **이미지 가장자리와 이어진 영역**만 지움 (flood fill). 캐릭터의 검정 부분(눈 위 V자, 눈동자, 깃털 선)을 지키기 위해서. 캐릭터에 둘러싸인 배경 틈 2곳(파 줄기 아래, 파와 날개 사이)은 영역별 크기·위치를 확인해서 따로 지움. 작업 스크립트는 저장소에 넣지 않음

### 기타
- 사용자가 3000에서 dev를 띄워두면 Next 16은 같은 폴더에서 두 번째 dev 서버를 막음("Another next dev server is already running"). 이때는 사용자 서버를 끄지 말고 읽기 전용 GET으로만 확인한다
- `content/about.mdx`가 없으면 Velite가 `no data resolved for 'about' collection`으로 실패함 (`single: true`). 빌드 검증 픽스처는 기본으로 about 파일을 넣는다 (`buildFixture`의 `withAbout`)
- 프로젝트 이름이 사이트 이름과 같으면(`haejinlog`) 헤더 로고 링크와 겹쳐서 Playwright strict mode 위반. 테스트에서 `main` 안으로 범위를 좁힘
- dev 서버가 켜진 상태에서 `pnpm build`·`pnpm lint`를 실행하면 `velite build --clean`이 `.velite`를 잠깐 지워서 dev 로그에 "Module not found: ./posts.json"이 찍힘. 곧 복구되므로 무시해도 됨
- Next 16.4는 `next dev`를 실행할 때 `AGENTS.md`를 자동으로 생성함 (번들 문서는 `node_modules/next/dist/docs/`)
- Biome 2.6은 마크다운도 포맷하려 해서 `.md`는 Biome 대상에서 제외함
- Biome의 `useMathMinMax` 제안은 ISO 날짜 문자열에 적용하면 안 됨 (`Math.max`는 `NaN`이 됨)
- pnpm 12는 의존성 빌드 스크립트를 기본 차단함. `esbuild`, `sharp`는 `pnpm-workspace.yaml`의 `allowBuilds`로 허용함

---

## 작업 이력

### 2026-11-19
- **Phase 1**: 프로젝트 셋업(Next 16.4 / React 19.3 / TS 6.0 / Tailwind 4.3 / Biome 2.6 / Velite 0.4 / Playwright 1.65), `lib/config.ts`, PostRepository(Velite 기반), 샘플 글 3개 + draft 1개, `/blog`, `/blog/[slug]`, 테스트 17개
- **Phase 2**: 태그(`/tags/[tag]`), 시리즈(`/series/[slug]`, SeriesRepository), TOC(rehype-slug), 이전/다음 편, 샘플 시리즈 1개(글 2개), 한글 태그 샘플, draft 이미지 차단, 한글 파라미터 dev 버그 수정, 병렬 테스트 버그 수정
- **추가**: `/series` 목록 페이지 + 상단 메뉴 (A안)
- 진행 기록 문서(`docs/PROGRESS.md`) 작성

### 2026-11-20
- **Phase 3**: `lib/seo/`(metadata, JSON-LD, RSS, OG 이미지), `lib/routes.ts`, 모든 페이지 canonical·OG·Twitter, 글 상세 BlogPosting + BreadcrumbList, 홈 Person, `sitemap.ts`, `robots.ts`, `rss.xml`, 글별 OG 이미지 + 사이트 기본 OG 이미지, 테스트 18개 추가(`tests/build/seo.spec.ts`, `tests/build/site-url.spec.ts`, `tests/e2e/feeds.spec.ts`)
- **Phase 4**: Project/About 스키마와 Repository(사용자 승인 초안), `/projects`, `/projects/[slug]`(BreadcrumbList), `/about`(Person JSON-LD, 연락처는 이메일만, PDF는 있을 때만), 홈 완성(최근 글 5개, 대표 프로젝트), 상단 메뉴 Projects·About, sitemap 추가, 대표 프로젝트 3개 초과 시 빌드 실패, 공개 금지 정보 검사(`tests/build/privacy.spec.ts`), 테스트 30개 추가
- **velog 마이그레이션 1차**: `.md` 지원(SPEC 결정 변경), `scripts/import-velog.ts`(`pnpm import:velog`), 시리즈 `frontend-to-product-developer` 7편 + 이미지 16개 가져옴, 샘플 글 4개·샘플 시리즈 삭제, 한국 시간 날짜 표시, 읽는 시간 계산 수정(한글), 빈 동적 경로 placeholder, `.md`/MDX 검증 테스트 2개 추가
- **대표 이미지**: 글 상단 대표 이미지(`PostCoverImage`), 블로그·홈 목록 미리보기 이미지(`previewImage`), 테스트 3개 추가
- **파비콘**: 사용자 이미지로 favicon.ico, icon.png, apple-icon.png 추가, 테스트 1개 추가
- **파비콘 배경 투명화 + 헤더 로고**: 아이콘 3종을 투명 배경으로 다시 만듦, 상단 `haejinlog` 앞에 같은 이미지 28px(`components/layout/site-logo.png`, 레티나용 56px) 추가
- **디자인 1차**: 글자 크기·굵기 적용, 보조 글자색 대비 수정, 모바일 헤더 겹침 수정.  `docs/DESIGN.md`(Telescope) 보관, `app/globals.css` 토큰 교체(라이트만), 테두리·2px 모서리·간격 정리, 현재 메뉴 강조(`components/layout/navigation-link.tsx`), 본문 prose 색상, OG 이미지 색상
- **헤더·맨 위로 버튼**: 상단 고정 헤더, GitHub 아이콘 링크, 글 상세 맨 위로 버튼(`components/post/scroll-to-top-button.tsx`), 테스트 5개 추가(`tests/e2e/header.spec.ts`)
- **목차 현재 섹션 강조**: `components/post/table-of-contents.tsx`를 클라이언트 컴포넌트로, 테스트 1개 추가

### 2026-11-22
- GitHub 원격 연결(`haejinyun/blog`, 공개). 커밋 전 민감 정보 점검: 비밀 파일·키·IP·실제 전화번호 없음, 글 이미지 EXIF에 위치·기기 정보 없음
- `docs/DESIGN.md`를 적용 규칙 요약으로 교체, 원문은 `docs/DESIGN.reference.local.md`(git 제외)
- draft 분리: `content/drafts/` 추가(git 제외), placeholder draft 프로젝트 이동, SPEC 콘텐츠 규칙·폴더 구조 수정
- Projects·About 메뉴와 홈 대표 프로젝트 섹션 주석 처리(숨김)
- **배포**: Vercel 배포, 도메인 `paori.dev`(가비아) 연결, 배포 결과물 주소·리다이렉트·HTTPS 확인
- **배포 마무리**: 네이버 서치어드바이저 메타 태그 + 테스트 1개, README Deployment 섹션, SPEC에 배포 범위·결정(2·3·4·12장) 반영하고 완료된 Phase 조건·미정 사항·다음 단계 항목 정리, PROGRESS 완료 항목 정리
- **사이트 이름·글자 크기**: 사이트 이름 `paori`, 글자 크기 토큰 축소(`heading-sm` 추가), 모바일 메뉴 간격
- **푸터 이스터에그**: 파오리 아이콘 + 모달(샘플 내용), 테스트 2개 추가
