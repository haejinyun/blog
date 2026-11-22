import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, test } from '@playwright/test';
import { DEFAULT_OUT_DIR, listFiles } from '../support/built-output';

/**
 * Phase 4 완료 조건: 공개 금지 정보(전화번호, 주소, 회사 내부 설정값)가 빌드 결과물 어디에도 없다.
 * - 전화번호: 형식이 정해져 있어서 정규식으로 찾는다.
 * - 주소, 회사 내부 설정값(포트, 컨테이너명, 내부 URL): 일반 규칙으로 찾을 수 없어서
 *   git 에 올리지 않는 .forbidden-strings.local 에 한 줄에 하나씩 적어 두면 그 문자열을 찾는다.
 *   (# 으로 시작하는 줄과 빈 줄은 무시. 목록 자체가 민감 정보라 레포에 두지 않는다.)
 */

const FORBIDDEN_STRINGS_FILE = join(process.cwd(), '.forbidden-strings.local');

/** 빌드 결과물 중 사람이 쓴 내용이 들어가는 파일 (JS 번들 포함) */
const SCANNED_EXTENSIONS = ['.html', '.xml', '.txt', '.json', '.js'];

/**
 * 한국 전화번호: 휴대폰(010-1234-5678, 01012345678, 010.1234.5678), 지역번호(02-123-4567, 031-1234-5678)
 * 해시나 긴 숫자 안에 우연히 들어간 경우를 빼기 위해 앞뒤가 영숫자가 아닐 때만 찾는다.
 */
const PHONE_NUMBER_PATTERN =
  /(?<![\w.-])(?:01[016789][-. ]?\d{3,4}[-. ]?\d{4}|0(?:2|[3-6][1-5])[-. ]\d{3,4}[-. ]\d{4})(?![\w-])/g;

function readScannedFiles(): { file: string; content: string }[] {
  return listFiles(DEFAULT_OUT_DIR, SCANNED_EXTENSIONS).map((file) => ({
    file: relative(DEFAULT_OUT_DIR, file),
    content: readFileSync(file, 'utf-8'),
  }));
}

function readForbiddenStrings(): string[] {
  if (!existsSync(FORBIDDEN_STRINGS_FILE)) return [];
  return readFileSync(FORBIDDEN_STRINGS_FILE, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

test('빌드 결과물에 전화번호가 없다', () => {
  const found = readScannedFiles().flatMap(({ file, content }) =>
    [...content.matchAll(PHONE_NUMBER_PATTERN)].map((match) => `${file}: ${match[0]}`),
  );
  expect(found).toEqual([]);
});

test('전화번호 패턴이 실제 형식을 잡아낸다 (패턴 자체 검증)', () => {
  const samples = ['010-1234-5678', '01012345678', '010.1234.5678', '02-123-4567', '031-123-4567'];
  for (const sample of samples) {
    expect(`연락처: ${sample}입니다`.match(PHONE_NUMBER_PATTERN), sample).not.toBeNull();
  }
  const nonPhones = ['2026-11-20', 'a01012345678b', 'v1.0.1', 'hash-010123456789'];
  for (const sample of nonPhones) {
    expect(sample.match(PHONE_NUMBER_PATTERN), sample).toBeNull();
  }
});

test('빌드 결과물에 .forbidden-strings.local 의 문자열(주소, 내부 설정값)이 없다', () => {
  const forbidden = readForbiddenStrings();
  test.skip(forbidden.length === 0, '.forbidden-strings.local 이 없거나 비어 있음');

  const files = readScannedFiles();
  const found = forbidden.flatMap((value) =>
    files.filter(({ content }) => content.includes(value)).map(({ file }) => `${file}: "${value}"`),
  );
  expect(found).toEqual([]);
});
