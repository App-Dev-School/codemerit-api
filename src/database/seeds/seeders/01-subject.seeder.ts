import { In, DataSource } from 'typeorm';
import { Subject } from 'src/common/typeorm/entities/subject.entity';

const SUBJECTS = [
  {
    title: 'JavaScript',
    slug: 'javascript',
    description: 'The language of the web — event-driven, prototype-based, and runs everywhere.',
    body: 'JavaScript is a versatile, high-level programming language essential for web development. It powers both frontend interactivity and backend services via Node.js.',
    scope: 'Frontend & Backend',
    color: '#F7DF1E',
    isPublished: true,
  },
  {
    title: 'TypeScript',
    slug: 'typescript',
    description: 'JavaScript with syntax for types — catch bugs before they reach runtime.',
    body: 'TypeScript is a strongly typed superset of JavaScript that compiles to plain JS. It improves developer productivity with static type checking and modern tooling.',
    scope: 'Frontend & Backend',
    color: '#3178C6',
    isPublished: true,
  },
  {
    title: 'Python',
    slug: 'python',
    description: 'Readable, versatile, and powerful — from scripting to AI and data science.',
    body: 'Python is a high-level, general-purpose programming language known for its simplicity and readability. It is widely used in web development, data science, and automation.',
    scope: 'Backend & Data',
    color: '#3776AB',
    isPublished: true,
  },
  {
    title: 'SQL & Databases',
    slug: 'sql-databases',
    description: 'Master data storage, retrieval, and management with SQL.',
    body: 'SQL is the standard language for managing relational databases. Understanding database design, indexing, and query optimization is critical for any backend engineer.',
    scope: 'Full Stack & Data',
    color: '#336791',
    isPublished: true,
  },
  {
    title: 'System Design',
    slug: 'system-design',
    description: 'Design scalable, reliable, and maintainable distributed systems.',
    body: 'System design covers architecture patterns, scalability principles, and reliability engineering. It is a key skill for senior engineering roles and technical interviews.',
    scope: 'Backend & Architecture',
    color: '#FF6B35',
    isPublished: true,
  },
];

export const SUBJECT_SLUGS = SUBJECTS.map((s) => s.slug);

export async function seedSubjects(dataSource: DataSource): Promise<Subject[]> {
  const repo = dataSource.getRepository(Subject);

  for (const data of SUBJECTS) {
    const exists = await repo.findOne({ where: { slug: data.slug } });
    if (!exists) {
      await repo.save(repo.create(data));
    }
  }

  const subjects = await repo.find({
    where: { slug: In(SUBJECT_SLUGS) },
    order: { id: 'ASC' },
  });

  console.log(`  ✔ Subjects: ${subjects.length} records`);
  return subjects;
}
