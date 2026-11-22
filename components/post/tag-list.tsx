import Link from 'next/link';
import { tagPath } from '@/lib/routes';

interface TagListProps {
  tags: string[];
}

export function TagList({ tags }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label="태그">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={tagPath(tag)}
            className="rounded-sm bg-surface px-[7px] py-1 text-caption tracking-caption text-muted-foreground hover:text-foreground"
          >
            #{tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
