import { In, DataSource } from 'typeorm';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { SubjectTrack } from 'src/common/typeorm/entities/subject-track.entity';

interface SubjectTrackSeed {
  title: string;
  slug: string;
  subjectSlug: string;
  description: string;
  sortOrder: number;
  isPublished: boolean;
}

const SUBJECT_TRACKS: SubjectTrackSeed[] = [
  // JavaScript
  { subjectSlug: 'javascript', title: 'JS Foundations', slug: 'js-foundations', description: 'Core JavaScript concepts every developer must know — variables, functions, DOM, and error handling.', sortOrder: 1, isPublished: true },
  { subjectSlug: 'javascript', title: 'JS Advanced', slug: 'js-advanced', description: 'Advanced JavaScript topics including async patterns, the event loop, prototypes, and modern ES6+ syntax.', sortOrder: 2, isPublished: true },

  // TypeScript
  { subjectSlug: 'typescript', title: 'TS Essentials', slug: 'ts-essentials', description: 'Essential TypeScript knowledge — type system, interfaces, type aliases, and utility types.', sortOrder: 1, isPublished: true },
  { subjectSlug: 'typescript', title: 'TS Deep Dive', slug: 'ts-deep-dive', description: 'Advanced TypeScript features including generics, decorators, and advanced type transformations.', sortOrder: 2, isPublished: true },

  // Python
  { subjectSlug: 'python', title: 'Python Basics', slug: 'python-basics', description: 'Python fundamentals covering data types, functions, list comprehension, and error handling.', sortOrder: 1, isPublished: true },
  { subjectSlug: 'python', title: 'Python Intermediate', slug: 'python-intermediate', description: 'Intermediate Python skills including OOP, modules, packages, and generators.', sortOrder: 2, isPublished: true },

  // SQL & Databases
  { subjectSlug: 'sql-databases', title: 'SQL Foundations', slug: 'sql-foundations', description: 'Core SQL skills — SELECT queries, JOINs, and aggregation for everyday data work.', sortOrder: 1, isPublished: true },
  { subjectSlug: 'sql-databases', title: 'SQL Advanced', slug: 'sql-advanced', description: 'Advanced database topics including indexes, transactions, stored procedures, and normalization.', sortOrder: 2, isPublished: true },

  // System Design
  { subjectSlug: 'system-design', title: 'System Design Basics', slug: 'sd-basics', description: 'Foundational system design concepts — scalability, load balancing, and API design.', sortOrder: 1, isPublished: true },
  { subjectSlug: 'system-design', title: 'System Design Advanced', slug: 'sd-advanced', description: 'Advanced distributed systems topics — caching, database design, microservices, and message queues.', sortOrder: 2, isPublished: true },
];

export const SUBJECT_TRACK_SLUGS = SUBJECT_TRACKS.map((t) => t.slug);

export async function seedSubjectTracks(
  dataSource: DataSource,
  subjects: Subject[],
): Promise<SubjectTrack[]> {
  const repo = dataSource.getRepository(SubjectTrack);
  const subjectMap = new Map(subjects.map((s) => [s.slug, s]));

  for (const data of SUBJECT_TRACKS) {
    const subject = subjectMap.get(data.subjectSlug);
    if (!subject) continue;

    const exists = await repo.findOne({
      where: { subjectId: subject.id, title: data.title },
    });
    if (!exists) {
      await repo.save(
        repo.create({
          title: data.title,
          slug: data.slug,
          subjectId: subject.id,
          description: data.description,
          sortOrder: data.sortOrder,
          isPublished: data.isPublished,
        }),
      );
    }
  }

  const tracks = await repo.find({
    where: { slug: In(SUBJECT_TRACK_SLUGS) },
    order: { subjectId: 'ASC', sortOrder: 'ASC' },
  });

  console.log(`  ✔ Subject Tracks: ${tracks.length} records`);
  return tracks;
}
