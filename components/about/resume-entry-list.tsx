import type { ResumeEntry } from '@/lib/content';
import { formatResumePeriod } from '@/lib/format-date';

interface ResumeEntryListProps {
  entries: ResumeEntry[];
}

/** 경력·코스·학력 항목 목록. 항목 사이는 1px 선으로 나눈다. */
export function ResumeEntryList({ entries }: ResumeEntryListProps) {
  return (
    <ul className="flex flex-col divide-y divide-border border-y border-border">
      {entries.map((entry) => (
        <li key={`${entry.title}-${entry.startDate}`} className="py-6">
          <ResumeEntryItem entry={entry} />
        </li>
      ))}
    </ul>
  );
}

function ResumeEntryItem({ entry }: { entry: ResumeEntry }) {
  return (
    <article className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <h3 className="break-keep text-body font-normal">
          {entry.title}
          {entry.role && <span className="text-muted-foreground"> · {entry.role}</span>}
        </h3>
        <p className="shrink-0 text-caption tracking-caption text-muted-foreground">
          {formatResumePeriod(entry.startDate, entry.endDate)}
        </p>
      </div>
      {entry.summary && <p className="break-keep">{entry.summary}</p>}
      {entry.team && (
        <p className="text-caption tracking-caption text-muted-foreground">
          팀 구성 · {entry.team}
        </p>
      )}
      {entry.highlights.length > 0 && (
        <ul className="flex list-disc flex-col gap-1 pl-5 break-keep marker:text-muted-foreground">
          {entry.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      )}
      {entry.techStack.length > 0 && (
        <p className="text-caption tracking-caption text-muted-foreground">
          {entry.techStack.join(', ')}
        </p>
      )}
      {entry.links.length > 0 && (
        <ul className="flex flex-wrap gap-4 text-caption tracking-caption" aria-label="링크">
          {entry.links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:no-underline"
              >
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
