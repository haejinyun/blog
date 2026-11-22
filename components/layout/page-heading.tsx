interface PageHeadingProps {
  title: string;
  description?: string;
}

export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <header className="flex flex-col gap-2 pb-4">
      <h1 className="text-heading-sm font-normal sm:text-heading-lg">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </header>
  );
}
