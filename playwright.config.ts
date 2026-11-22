import { defineConfig, devices } from '@playwright/test';

const PREVIEW_PORT = 4321;

/**
 * 빌드는 test 스크립트가 먼저 실행한다 (테스트 수집 시점에 .velite 가 필요하기 때문).
 * - e2e: 빌드 결과물(out/)을 preview 스크립트로 띄워 브라우저로 검증한다.
 * - build: 빌드 결과물 파일과 콘텐츠 검증(빌드 실패 조건)을 확인한다. 브라우저를 쓰지 않는다.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PREVIEW_PORT}`,
  },
  projects: [
    { name: 'build', testDir: './tests/build' },
    { name: 'e2e', testDir: './tests/e2e', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `pnpm preview -l ${PREVIEW_PORT}`,
    url: `http://localhost:${PREVIEW_PORT}`,
    reuseExistingServer: false,
    timeout: 30_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
