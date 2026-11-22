import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, test } from '@playwright/test';

/**
 * 콘텐츠 규칙 위반 시 빌드가 실패하는지 확인한다.
 * 실제 content/ 를 건드리지 않도록 tests/.tmp/<case>/ 에 임시 콘텐츠를 만들고,
 * 프로젝트의 velite.config.ts 를 그대로 재사용하는 설정 파일로 빌드한다.
 * (Velite 는 root/output 경로를 설정 파일 위치 기준으로 해석한다.)
 */
const TMP_ROOT = join(process.cwd(), 'tests', '.tmp');

type FixtureFiles = Record<string, string | Buffer>;

function writeFixture(dir: string, files: FixtureFiles): void {
  writeFixtureFile(dir, 'velite.config.ts', "export { default } from '../../../velite.config';\n");
  for (const [path, content] of Object.entries(files)) {
    writeFixtureFile(dir, path, content);
  }
}

function writeFixtureFile(dir: string, path: string, content: string | Buffer): void {
  const file = join(dir, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

/**
 * 픽스처 콘텐츠를 만들고, package.json 의 build:content 와 같은 옵션으로 빌드한 뒤 픽스처를 지운다.
 * 테스트가 병렬로 돌기 때문에 각 테스트는 자기 픽스처 폴더만 만들고 지운다.
 */
function buildFixture(name: string, files: FixtureFiles, { withAbout = true } = {}) {
  const dir = join(TMP_ROOT, name);
  rmSync(dir, { recursive: true, force: true });
  try {
    writeFixture(dir, withAbout ? { [ABOUT_PATH]: aboutFile(), ...files } : files);
    const result = spawnSync(
      'pnpm',
      ['exec', 'velite', 'build', '--clean', '--strict', '--config', join(dir, 'velite.config.ts')],
      { encoding: 'utf-8' },
    );
    const postsFile = join(dir, '.velite', 'posts.json');
    const posts = existsSync(postsFile)
      ? (JSON.parse(readFileSync(postsFile, 'utf-8')) as Record<string, unknown>[])
      : [];
    return { exitCode: result.status, output: `${result.stdout}${result.stderr}`, posts };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const ABOUT_PATH = 'content/about.mdx';

function aboutFile(): string {
  return [
    '---',
    'title: "About"',
    'description: "설명"',
    'updated: 2026-11-01',
    '---',
    '',
    '이력',
    '',
  ].join('\n');
}

function seriesFile(title: string): string {
  return ['---', `title: "${title}"`, 'description: "설명"', '---', '', '소개', ''].join('\n');
}

function postFile(frontmatter: Record<string, string>): string {
  const lines = Object.entries(frontmatter).map(([key, value]) => `${key}: ${value}`);
  return ['---', ...lines, '---', '', '본문', ''].join('\n');
}

const validFrontmatter = {
  title: '"제목"',
  description: '"설명"',
  date: '2026-11-01',
  tags: '[test]',
};

test('규칙을 지킨 콘텐츠는 빌드에 성공한다 (대조군)', () => {
  const { exitCode, output } = buildFixture('valid', {
    'content/posts/2026/10/first/index.mdx': postFile(validFrontmatter),
    'content/posts/2026/11/second/index.mdx': postFile({
      ...validFrontmatter,
      series: 'existing-series',
      seriesOrder: '1',
    }),
    'content/series/existing-series.md': seriesFile('있는 시리즈'),
  });

  expect(exitCode, output).toBe(0);
});

test('존재하지 않는 시리즈를 참조한 글이 있으면 빌드가 실패한다', () => {
  const { exitCode, output } = buildFixture('missing-series', {
    'content/posts/2026/11/orphan/index.mdx': postFile({
      ...validFrontmatter,
      series: 'ghost-series',
      seriesOrder: '1',
    }),
    'content/series/existing-series.md': seriesFile('있는 시리즈'),
  });

  expect(exitCode).not.toBe(0);
  expect(output).toContain('존재하지 않는 시리즈');
  expect(output).toContain('ghost-series');
});

test('서로 다른 날짜 폴더에 같은 slug 가 있으면 빌드가 실패한다', () => {
  const { exitCode, output } = buildFixture('duplicate-slug', {
    'content/posts/2026/10/same-slug/index.mdx': postFile(validFrontmatter),
    'content/posts/2026/11/same-slug/index.mdx': postFile(validFrontmatter),
  });

  expect(exitCode).not.toBe(0);
  expect(output).toContain('slug 가 중복되었습니다');
  expect(output).toContain('same-slug');
});

for (const field of ['title', 'description', 'date', 'tags'] as const) {
  test(`필수 frontmatter "${field}" 가 없으면 빌드가 실패한다`, () => {
    const { [field]: _omitted, ...frontmatter } = validFrontmatter;
    const { exitCode, output } = buildFixture(`missing-${field}`, {
      'content/posts/2026/11/missing/index.mdx': postFile(frontmatter),
    });

    expect(exitCode).not.toBe(0);
    expect(output).toContain(field);
  });
}

test('about.mdx 가 없으면 빌드가 실패한다', () => {
  const { exitCode, output } = buildFixture(
    'missing-about',
    { 'content/posts/2026/11/first/index.mdx': postFile(validFrontmatter) },
    { withAbout: false },
  );

  expect(exitCode).not.toBe(0);
  expect(output).toContain('about');
});

const validProjectFrontmatter = {
  title: '"프로젝트"',
  description: '"설명"',
  startDate: '2026-01',
  role: '"개발"',
  techStack: '[TypeScript]',
};

test('규칙을 지킨 프로젝트는 빌드에 성공한다 (대조군)', () => {
  const { exitCode, output } = buildFixture('valid-project', {
    'content/projects/sample/index.mdx': postFile({
      ...validProjectFrontmatter,
      endDate: '2026-03',
      links: '[{ label: GitHub, url: "https://github.com/example" }]',
      featured: 'true',
      featuredOrder: '1',
    }),
  });

  expect(exitCode, output).toBe(0);
});

for (const field of ['title', 'description', 'startDate', 'role', 'techStack'] as const) {
  test(`프로젝트 필수 frontmatter "${field}" 가 없으면 빌드가 실패한다`, () => {
    const { [field]: _omitted, ...frontmatter } = validProjectFrontmatter;
    const { exitCode, output } = buildFixture(`missing-project-${field}`, {
      'content/projects/missing/index.mdx': postFile(frontmatter),
    });

    expect(exitCode).not.toBe(0);
    expect(output).toContain(field);
  });
}

test('프로젝트 기간이 YYYY-MM 형식이 아니면 빌드가 실패한다', () => {
  const { exitCode, output } = buildFixture('invalid-project-date', {
    'content/projects/bad-date/index.mdx': postFile({
      ...validProjectFrontmatter,
      startDate: '2026-13',
    }),
  });

  expect(exitCode).not.toBe(0);
  expect(output).toContain('YYYY-MM');
});

test('공개 대표 프로젝트가 3개를 넘으면 빌드가 실패한다 (draft 는 세지 않는다)', () => {
  const featured = (slug: string, draft = false) => ({
    [`content/projects/${slug}/index.mdx`]: postFile({
      ...validProjectFrontmatter,
      featured: 'true',
      draft: String(draft),
    }),
  });

  const withinLimit = buildFixture('featured-within-limit', {
    ...featured('a'),
    ...featured('b'),
    ...featured('c'),
    ...featured('draft-d', true),
  });
  expect(withinLimit.exitCode, withinLimit.output).toBe(0);

  const overLimit = buildFixture('featured-over-limit', {
    ...featured('a'),
    ...featured('b'),
    ...featured('c'),
    ...featured('d'),
  });
  expect(overLimit.exitCode).not.toBe(0);
  expect(overLimit.output).toContain('대표 프로젝트');
});

test('.md 글은 일반 마크다운으로 해석된다 (HTML, 중괄호, 꺾쇠가 있어도 빌드된다)', () => {
  const frontmatter = Object.entries(validFrontmatter).map(([key, value]) => `${key}: ${value}`);
  const markdownPost = [
    '---',
    ...frontmatter,
    '---',
    '',
    '첫 줄<br>둘째 줄',
    '',
    '객체는 {a: 1} 처럼 쓰고, a<b 는 비교식이다.',
    '',
    '<!-- 주석 -->',
    '',
  ].join('\n');

  const { exitCode, output } = buildFixture('markdown-post', {
    'content/posts/2026/11/plain-markdown/index.md': markdownPost,
  });

  expect(exitCode, output).toBe(0);
});

test('같은 본문을 .mdx 로 두면 MDX 문법 오류로 빌드가 실패한다 (대조군)', () => {
  const frontmatter = Object.entries(validFrontmatter).map(([key, value]) => `${key}: ${value}`);
  const mdxPost = ['---', ...frontmatter, '---', '', '객체는 {a: 1} 처럼 쓴다.', ''].join('\n');

  const { exitCode } = buildFixture('mdx-syntax-error', {
    'content/posts/2026/11/broken-mdx/index.mdx': mdxPost,
  });

  expect(exitCode).not.toBe(0);
});

/** 1x1 PNG (픽스처 이미지용) */
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

test('목록 미리보기 이미지는 대표 이미지(thumbnail), 없으면 본문 첫 이미지를 쓴다', () => {
  const postWithBody = (extra: Record<string, string>, body: string) => {
    const lines = Object.entries({ ...validFrontmatter, ...extra }).map(([k, v]) => `${k}: ${v}`);
    return ['---', ...lines, '---', '', body, ''].join('\n');
  };

  const { exitCode, output, posts } = buildFixture('preview-image', {
    'content/posts/2026/11/with-thumbnail/index.md': postWithBody(
      { thumbnail: './cover.png' },
      '![본문](./body.png)',
    ),
    'content/posts/2026/11/with-thumbnail/cover.png': TINY_PNG,
    'content/posts/2026/11/with-thumbnail/body.png': TINY_PNG,
    'content/posts/2026/11/body-image-only/index.md': postWithBody({}, '![첫 이미지](./first.png)'),
    'content/posts/2026/11/body-image-only/first.png': TINY_PNG,
    'content/posts/2026/11/no-image/index.md': postWithBody({}, '이미지 없음'),
  });
  expect(exitCode, output).toBe(0);

  const bySlug = new Map(posts.map((post) => [post.slug, post]));
  const withThumbnail = bySlug.get('with-thumbnail');
  expect(withThumbnail?.thumbnail).toMatch(/^\/static\/cover-/);
  expect(withThumbnail?.previewImage).toBe(withThumbnail?.thumbnail);

  const bodyImageOnly = bySlug.get('body-image-only');
  expect(bodyImageOnly?.thumbnail).toBeUndefined();
  expect(bodyImageOnly?.previewImage).toMatch(/^\/static\/first-/);

  expect(bySlug.get('no-image')?.previewImage).toBeUndefined();
});
