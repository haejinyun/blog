import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/config';

/**
 * 빌드 시점 OG 이미지 렌더러 (next/og).
 * next/og 는 woff2 를 읽지 못해서 Pretendard 는 otf 파일을 쓴다. 한글 글리프 때문에 서브셋 없이 전체 폰트를 넣는다.
 */

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
export const OG_IMAGE_CONTENT_TYPE = 'image/png';

const FONT_DIR = join(process.cwd(), 'node_modules/pretendard/dist/public/static');

// docs/DESIGN.md 팔레트 (app/globals.css 토큰과 같은 값). 강조색(라임)은 사이트 메뉴에만 쓰므로 여기서는 쓰지 않는다.
const COLORS = {
  background: '#f4f3f0', // Bone Paper
  foreground: '#1a1915', // Ink
  muted: '#686c73', // Ash (대비를 맞춰 진하게 한 값)
} as const;

interface OgImageContent {
  title: string;
  /** 제목 위 작은 글씨 (예: 날짜, 시리즈명) */
  eyebrow?: string;
  description?: string;
}

async function loadFonts() {
  const [regular, bold] = await Promise.all([
    readFile(join(FONT_DIR, 'Pretendard-Regular.otf')),
    readFile(join(FONT_DIR, 'Pretendard-Bold.otf')),
  ]);
  return [
    { name: 'Pretendard', data: regular, weight: 400 as const, style: 'normal' as const },
    { name: 'Pretendard', data: bold, weight: 700 as const, style: 'normal' as const },
  ];
}

export async function renderOgImage({
  title,
  eyebrow,
  description,
}: OgImageContent): Promise<ImageResponse> {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: COLORS.background,
        color: COLORS.foreground,
        fontFamily: 'Pretendard',
        borderTop: `16px solid ${COLORS.foreground}`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {eyebrow && <div style={{ fontSize: 32, color: COLORS.muted }}>{eyebrow}</div>}
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em' }}>
          {title}
        </div>
        {description && (
          <div style={{ fontSize: 34, color: COLORS.muted, lineHeight: 1.4 }}>{description}</div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 30 }}>
        <span style={{ fontWeight: 700 }}>{siteConfig.title}</span>
        <span style={{ color: COLORS.muted }}>{siteConfig.author.name}</span>
      </div>
    </div>,
    { ...OG_IMAGE_SIZE, fonts: await loadFonts() },
  );
}
