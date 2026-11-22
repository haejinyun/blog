import type { ReactNode } from 'react';

interface AboutSectionProps {
  id: string;
  label: string;
  children: ReactNode;
}

/** 이력 페이지의 한 섹션. 위쪽 선과 작은 대문자 라벨 아래에 내용을 놓는다. */
export function AboutSection({ id, label, children }: AboutSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-6">
      <h2
        id={headingId}
        className="text-caption font-normal tracking-caption text-muted-foreground uppercase"
      >
        {label}
      </h2>
      {children}
    </section>
  );
}
