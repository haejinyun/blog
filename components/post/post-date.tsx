import { formatDate } from '@/lib/format-date';

interface PostDateProps {
  date: string;
}

export function PostDate({ date }: PostDateProps) {
  return <time dateTime={date}>{formatDate(date)}</time>;
}
