import type { ComponentProps, ComponentType } from 'react';
import * as runtime from 'react/jsx-runtime';

type MdxComponents = Record<string, ComponentType<never>>;

interface MdxContentProps {
  /** Velite 가 컴파일한 MDX (function-body 형식) */
  code: string;
  components?: MdxComponents;
}

/** 컴파일된 MDX 코드를 React 컴포넌트로 실행한다. 빌드 시점(서버 컴포넌트)에만 실행된다. */
function evaluateMdx(code: string): ComponentType<{ components?: MdxComponents }> {
  const run = new Function(code);
  return run({ ...runtime }).default;
}

function MdxImage({ alt = '', ...props }: ComponentProps<'img'>) {
  // 정적 export 라 이미지 최적화 서버가 없고, 본문 이미지는 크기 정보가 없어 next/image 대신 img 를 쓴다.
  // biome-ignore lint/performance/noImgElement: 정적 export 환경의 MDX 본문 이미지
  return <img alt={alt} loading="lazy" decoding="async" {...props} />;
}

const defaultComponents: MdxComponents = {
  img: MdxImage,
};

export function MdxContent({ code, components }: MdxContentProps) {
  const Content = evaluateMdx(code);
  return <Content components={{ ...defaultComponents, ...components }} />;
}
