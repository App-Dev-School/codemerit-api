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
    title: 'Cloud Basics',
    slug: 'cloud-basics',
    description: 'Provider-agnostic cloud infrastructure concepts for compute, storage, networking, security, and operations.',
    body: 'Cloud Basics covers the architecture, service models, and operational practices that power modern cloud platforms without tying the learning to AWS, Azure, or GCP.',
    scope: 'Cloud & Infrastructure',
    color: '#00A3E0',
    isPublished: true,
  },
  {
    title: 'Git',
    slug: 'git',
    description: 'Industry-standard version control for collaboration, branching, releases, and infrastructure workflows.',
    body: 'Git teaches source control fundamentals, branching strategies, remote workflows, and how teams use Git to manage both application and infrastructure code safely.',
    scope: 'Developer Tools',
    color: '#F05032',
    isPublished: true,
  },
  {
    title: 'DevOps',
    slug: 'devops',
    description: 'The culture, practices, and automation patterns that connect development and operations for faster, safer delivery.',
    body: 'DevOps focuses on continuous integration, continuous delivery, infrastructure as code, observability, and collaborative practices that help teams ship software reliably.',
    scope: 'Infrastructure & DevOps',
    color: '#7D4CDB',
    isPublished: true,
  },
  {
    title: 'Docker',
    slug: 'docker',
    description: 'Containerisation foundations for packaging, shipping, and running applications consistently.',
    body: 'Docker covers the container lifecycle from image creation to registries, networking, volumes, and production-ready container workflows.',
    scope: 'Infrastructure & DevOps',
    color: '#2496ED',
    isPublished: true,
  },
  {
    title: 'Kubernetes',
    slug: 'kubernetes',
    description: 'Container orchestration for deploying, scaling, and running distributed applications.',
    body: 'Kubernetes teaches how to define, deploy, and operate containerised applications using Pods, Services, Deployments, and cluster primitives.',
    scope: 'Infrastructure & DevOps',
    color: '#326CE5',
    isPublished: true,
  },
  {
    title: 'CI/CD',
    slug: 'ci-cd',
    description: 'Build, test, and deployment automation for reliable software delivery.',
    body: 'CI/CD covers pipeline design, automated testing, delivery workflows, rollback strategies, and releasing software with confidence.',
    scope: 'Infrastructure & DevOps',
    color: '#FF6F00',
    isPublished: true,
  },
  {
    title: 'Jenkins',
    slug: 'jenkins',
    description: 'A practical CI automation tool for building, testing, and deploying applications.',
    body: 'Jenkins teaches how to author pipeline jobs, integrate tests, and automate deployments in a flexible automation server environment.',
    scope: 'Infrastructure & DevOps',
    color: '#D2472D',
    isPublished: true,
  },
  {
    title: 'Relational Databases',
    slug: 'relational-databases',
    description: 'Design, query, and manage structured data using relational database systems and SQL.',
    body: 'Relational Databases teaches schema design, SQL querying, transactions, indexing, and how relational data underpins many cloud applications.',
    scope: 'Data & Backend',
    color: '#0E6E62',
    isPublished: true,
  },
  {
    title: 'MongoDB',
    slug: 'mongodb',
    description: 'NoSQL document database fundamentals for flexible, cloud-native data storage.',
    body: 'MongoDB covers document schema design, CRUD operations, indexing, aggregation, and how modern applications use NoSQL databases in cloud environments.',
    scope: 'Data & Backend',
    color: '#47A248',
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
