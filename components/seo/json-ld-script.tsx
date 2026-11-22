import { type JsonLd, serializeJsonLd } from '@/lib/seo/json-ld';

interface JsonLdScriptProps {
  data: JsonLd;
}

export function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: serializeJsonLd 가 '<' 를 이스케이프한 JSON 만 넣는다
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
