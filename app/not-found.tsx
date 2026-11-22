import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="flex flex-col items-start gap-4">
      <p className="text-caption tracking-caption text-muted-foreground uppercase">404</p>
      <h1 className="text-heading-sm font-normal sm:text-heading-lg">페이지를 찾을 수 없습니다</h1>
      <p className="text-muted-foreground">주소가 바뀌었거나 삭제된 페이지입니다.</p>
      <Link href="/blog" className="underline underline-offset-4 hover:no-underline">
        글 목록으로 가기 →
      </Link>
    </section>
  );
}
