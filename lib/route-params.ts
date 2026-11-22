/**
 * 동적 경로 파라미터 처리.
 *
 * Next dev 서버는 `output: 'export'` 에서 퍼센트 인코딩된 요청 경로('/tags/%ED%9A%8C%EA%B3%A0')를
 * generateStaticParams 결과 경로('/tags/회고')와 그대로 비교해서, 한글 등 비 ASCII 파라미터가 500 이 된다.
 * (next/dist/server/dev/next-dev-server.js 의 "is missing param" 검사)
 * 정적 빌드는 이 문제가 없으므로 dev 에서만 인코딩된 값을 함께 돌려준다.
 */

/**
 * 값이 하나도 없을 때 대신 만드는 경로. `output: 'export'` 는 동적 경로가 0개면 빌드를 실패시키므로
 * (예: 태그가 달린 글이 없을 때) 이 값으로 페이지를 하나 만들고, 페이지는 데이터가 없어 404 를 낸다.
 * 이 값은 어떤 링크·sitemap 에도 나오지 않는다.
 */
export const EMPTY_PARAM_PLACEHOLDER = '__empty__';

/**
 * generateStaticParams 결과를 만든다. dev 에서는 인코딩된 값도 넣고, 값이 없으면 placeholder 하나를 넣는다.
 * 예: toStaticParams('slug', ['a', 'b']) → [{ slug: 'a' }, { slug: 'b' }]
 */
export function toStaticParams<Key extends string>(
  key: Key,
  values: string[],
): Record<Key, string>[] {
  const expanded = values.flatMap(toStaticParamValues);
  const params = expanded.length > 0 ? expanded : [EMPTY_PARAM_PLACEHOLDER];
  return params.map((value) => ({ [key]: value }) as Record<Key, string>);
}

/** 파라미터 값 하나를 목록으로 만든다. (dev 에서는 인코딩된 값도 포함) */
function toStaticParamValues(value: string): string[] {
  if (process.env.NODE_ENV !== 'development') return [value];
  const encoded = encodeURIComponent(value);
  if (encoded === value) return [value];
  return [value, encoded];
}

/** 페이지에서 받은 파라미터를 원래 값으로 되돌린다. ('%ED%9A%8C%EA%B3%A0' → '회고') */
export function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
