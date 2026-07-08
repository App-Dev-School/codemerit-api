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

  // Cloud & Infrastructure
  { subjectSlug: 'cloud-basics', title: 'Cloud Foundations', slug: 'cloud-foundations', description: 'Provider-agnostic cloud platform fundamentals — service models, networking, storage, and security.', sortOrder: 1, isPublished: true },
  { subjectSlug: 'cloud-basics', title: 'Cloud Operations', slug: 'cloud-operations', description: 'Operational practices for cloud systems, including monitoring, cost control, and reliability.', sortOrder: 2, isPublished: true },
  { subjectSlug: 'git', title: 'Git Foundations', slug: 'git-foundations', description: 'Learn Git basics, branching, commits, and remote collaboration workflows.', sortOrder: 1, isPublished: true },
  { subjectSlug: 'git', title: 'Git Advanced', slug: 'git-advanced', description: 'Advanced Git capabilities including rebasing, bisect, stash workflows, and repository hygiene.', sortOrder: 2, isPublished: true },
  { subjectSlug: 'devops', title: 'DevOps Foundations', slug: 'devops-foundations', description: 'Core DevOps principles and practices for collaborative, automated delivery.', sortOrder: 1, isPublished: true },
  { subjectSlug: 'devops', title: 'Infrastructure as Code', slug: 'infrastructure-as-code', description: 'Declarative infrastructure management, automation, and repeatable environment provisioning.', sortOrder: 2, isPublished: true },
  { subjectSlug: 'devops', title: 'Observability & Reliability', slug: 'observability-reliability', description: 'Monitoring, logging, incident response, and reliability practices for modern systems.', sortOrder: 3, isPublished: true },
  { subjectSlug: 'docker', title: 'Docker Foundations', slug: 'docker-foundations', description: 'Fundamental Docker concepts for building and running containerised applications.', sortOrder: 1, isPublished: true },
  { subjectSlug: 'kubernetes', title: 'Kubernetes Basics', slug: 'kubernetes-basics', description: 'Learn Kubernetes primitives like Pods, Deployments, and Services to run containerised apps at scale.', sortOrder: 1, isPublished: true },
  { subjectSlug: 'ci-cd', title: 'CI/CD Foundations', slug: 'ci-cd-foundations', description: 'Core continuous integration and continuous delivery workflows for reliable releases.', sortOrder: 1, isPublished: true },
  { subjectSlug: 'jenkins', title: 'Jenkins Basics', slug: 'jenkins-basics', description: 'Introduction to Jenkins pipelines, jobs, and automation tasks for build and deploy workflows.', sortOrder: 1, isPublished: true },
  { subjectSlug: 'relational-databases', title: 'Relational DB Foundations', slug: 'relational-db-foundations', description: 'Fundamentals of relational schema design, SQL querying, and data integrity.', sortOrder: 1, isPublished: true },
  { subjectSlug: 'mongodb', title: 'MongoDB Fundamentals', slug: 'mongodb-fundamentals', description: 'Introductory MongoDB concepts for document models, CRUD operations, and indexing.', sortOrder: 1, isPublished: true },

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
