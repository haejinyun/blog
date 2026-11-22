import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import {
  collectAssetNames,
  draftPosts,
  draftProjects,
  publishedPosts,
  publishedProjects,
} from '../support/built-content';

const OUT_DIR = join(process.cwd(), 'out');

function listFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));
}

test('모든 공개 글의 HTML 이 out/ 에 생성된다', () => {
  for (const post of publishedPosts) {
    expect(existsSync(join(OUT_DIR, 'blog', `${post.slug}.html`)), post.slug).toBe(true);
  }
});

test('draft 글은 빌드 결과물 어디에도 없다', () => {
  test.skip(draftPosts.length === 0, 'draft 글이 없음');
  const textFiles = listFiles(OUT_DIR).filter((file) => /\.(html|txt|js|json|xml)$/.test(file));

  for (const draft of draftPosts) {
    expect(existsSync(join(OUT_DIR, 'blog', `${draft.slug}.html`))).toBe(false);
    const leaked = textFiles.filter((file) => {
      const content = readFileSync(file, 'utf-8');
      return content.includes(draft.slug) || content.includes(draft.title);
    });
    expect(leaked, `draft "${draft.slug}" 가 노출된 파일`).toEqual([]);
  }
});

test('draft 글에서만 쓰는 이미지는 빌드 결과물에 복사되지 않는다', () => {
  const publishedAssets = new Set(publishedPosts.flatMap(collectAssetNames));
  const draftOnlyAssets = draftPosts
    .flatMap(collectAssetNames)
    .filter((name) => !publishedAssets.has(name));
  test.skip(draftOnlyAssets.length === 0, 'draft 전용 이미지가 없음');

  for (const name of draftOnlyAssets) {
    expect(existsSync(join(OUT_DIR, 'static', name)), name).toBe(false);
  }
});

test('공개 글이 쓰는 이미지는 빌드 결과물에 있다', () => {
  for (const name of publishedPosts.flatMap(collectAssetNames)) {
    expect(existsSync(join(OUT_DIR, 'static', name)), name).toBe(true);
  }
});

test('모든 공개 프로젝트의 HTML 이 out/ 에 생성된다', () => {
  for (const project of publishedProjects) {
    expect(existsSync(join(OUT_DIR, 'projects', `${project.slug}.html`)), project.slug).toBe(true);
  }
});

test('draft 프로젝트는 빌드 결과물 어디에도 없다', () => {
  test.skip(draftProjects.length === 0, 'draft 프로젝트가 없음');
  const textFiles = listFiles(OUT_DIR).filter((file) => /\.(html|txt|js|json|xml)$/.test(file));

  for (const draft of draftProjects) {
    expect(existsSync(join(OUT_DIR, 'projects', `${draft.slug}.html`))).toBe(false);
    const leaked = textFiles.filter((file) => {
      const content = readFileSync(file, 'utf-8');
      return content.includes(draft.slug) || content.includes(draft.title);
    });
    expect(leaked, `draft "${draft.slug}" 가 노출된 파일`).toEqual([]);
  }
});
