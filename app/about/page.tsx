import type { Metadata } from 'next';
import { AboutHero } from '@/components/about/about-hero';
import { AboutSection } from '@/components/about/about-section';
import { ResumeEntryList } from '@/components/about/resume-entry-list';
import { MdxContent } from '@/components/mdx/mdx-content';
import { TechStackList } from '@/components/project/tech-stack-list';
import { JsonLdScript } from '@/components/seo/json-ld-script';
import { aboutRepository } from '@/lib/content';
import { createPersonJsonLd } from '@/lib/seo/json-ld';
import { createPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const about = await aboutRepository.getAbout();
  return createPageMetadata({ title: about.title, description: about.description, path: '/about' });
}

export default async function AboutPage() {
  const about = await aboutRepository.getAbout();
  const entrySections = [
    { id: 'work', label: 'Work', entries: about.work },
    { id: 'projects', label: 'Courses / Projects', entries: about.projects },
    { id: 'education', label: 'Education', entries: about.education },
  ].filter((section) => section.entries.length > 0);

  return (
    <div className="flex flex-col gap-section">
      <JsonLdScript data={createPersonJsonLd()} />
      <AboutHero role={about.role} headline={about.headline} resumePdf={about.resumePdf} />
      <AboutSection id="introduce" label="Introduce">
        <div className="flex flex-col gap-2 break-keep sm:text-body [&_p:first-child]:text-body [&_p:first-child]:sm:text-heading-sm">
          <MdxContent code={about.body} />
        </div>
      </AboutSection>
      <AboutSection id="skills" label="Skills">
        <TechStackList items={about.skills} />
      </AboutSection>
      {entrySections.map((section) => (
        <AboutSection key={section.id} id={section.id} label={section.label}>
          <ResumeEntryList entries={section.entries} />
        </AboutSection>
      ))}
    </div>
  );
}
