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

/**
 * 표는 가로 스크롤 상자로 감싼다. 칸이 많거나 줄바꿈 안 되는 내용(인라인 코드 등)이 있으면
 * 표가 화면보다 넓어져 모바일에서 페이지 전체가 가로로 밀리기 때문이다 (코드 블록과 같은 방식).
 * 한글 단어가 칸 안에서 글자 단위로 끊기지 않게 break-keep, 그래도 넓으면 표만 스크롤된다.
 */
function MdxTable(props: ComponentProps<'table'>) {
  return (
    <div className="overflow-x-auto break-keep">
      <table {...props} />
    </div>
  );
}

const defaultComponents: MdxComponents = {
  img: MdxImage,
  table: MdxTable,
};

export function MdxContent({ code, components }: MdxContentProps) {
  const Content = evaluateMdx(code);
  return <Content components={{ ...defaultComponents, ...components }} />;
}
