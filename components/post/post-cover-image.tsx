interface PostCoverImageProps {
  src: string;
}

/** 글 상단의 대표(메인) 이미지. 첫 화면에 보이므로 지연 로딩하지 않는다. */
export function PostCoverImage({ src }: PostCoverImageProps) {
  return (
    // biome-ignore lint/performance/noImgElement: 정적 export 라 next/image 최적화를 쓰지 않는다
    <img
      src={src}
      alt=""
      fetchPriority="high"
      decoding="async"
      className="aspect-video w-full rounded-sm object-cover"
    />
  );
}
