import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

/**
 * 정적 결과물 폴더. 평소에는 out/ 이다.
 * EXPORT_OUT_DIR 은 검증용 빌드를 out/ 과 겹치지 않는 폴더에 만들 때만 쓴다
 * (tests/build/site-url.spec.ts 가 NEXT_PUBLIC_SITE_URL 을 바꿔 빌드하는 경우).
 * output: 'export' 에서 distDir 을 지정하면 export 위치만 바뀌고 빌드 산출물은 .next 에 남는다.
 */
const exportOutDir = process.env.EXPORT_OUT_DIR;

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
  typedRoutes: true,
  ...(exportOutDir ? { distDir: exportOutDir } : {}),
};

/**
 * dev 서버에서는 콘텐츠 변경을 감지하도록 Velite 를 watch 모드로 함께 실행한다.
 * 프로덕션 빌드는 package.json 의 build 스크립트에서 `velite build --strict` 를 먼저 실행한다.
 */
async function startContentWatcher(): Promise<void> {
  if (process.env.VELITE_STARTED) return;
  process.env.VELITE_STARTED = '1';
  const { build } = await import('velite');
  await build({ watch: true, clean: false });
}

export default async function config(phase: string): Promise<NextConfig> {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    await startContentWatcher();
  }
  return nextConfig;
}
