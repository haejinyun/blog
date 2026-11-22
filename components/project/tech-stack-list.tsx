interface TechStackListProps {
  items: string[];
}

export function TechStackList({ items }: TechStackListProps) {
  if (items.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label="기술 스택">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-sm border border-border px-[7px] py-0.5 text-caption tracking-caption"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
