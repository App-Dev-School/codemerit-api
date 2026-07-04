import { DataSource } from 'typeorm';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';

/**
 * Canonical job role list for CodeMerit.
 *
 * orderId drives the order learners see when picking their career path:
 *   1–2   Entry level       → absolute beginners
 *   3–7   Core web dev      → most common industry targets
 *   8–10  JS ecosystem      → framework specialists
 *   11–12 Language tracks   → Python, Java
 *   13–15 Mobile            → Android, iOS, cross-platform
 *   16–18 Infrastructure    → DevOps, Cloud, Data
 *   19–21 AI / ML           → ML engineer paths
 *   22–23 Quality assurance → QA & testing
 *   24    Management        → Program / project management
 *   99    System role       → not shown to learners (isPublished: false)
 */
const JOB_ROLES = [
  // ── Entry Level ────────────────────────────────────────────────────────────
  {
    title: 'Trainee Software Engineer',
    slug: 'trainee-software-engineer',
    description: 'Start your journey into software engineering by building solid programming and problem-solving foundations.',
    body: 'Trainee software engineers are at the start of their career. They focus on writing clean code, understanding version control, debugging, and working within a collaborative development team.',
    scope: 'Entry Level',
    color: '#F59E0B',
    orderId: 1,
    isPublished: true,
  },
  {
    title: 'Programmer Level 1',
    slug: 'programmer-1',
    description: 'Develop core programming skills across syntax, logic, and data structures in a primary language.',
    body: 'Level 1 programmers build the fundamental skills needed for any software role — variables, control flow, functions, basic data structures, and applying logic to solve real problems.',
    scope: 'Entry Level',
    color: '#FBBF24',
    orderId: 2,
    isPublished: true,
  },

  // ── Core Web & Software Development ───────────────────────────────────────
  {
    title: 'Software Engineer',
    slug: 'software-engineer',
    description: 'Design, build, and maintain software systems across the full engineering lifecycle.',
    body: 'Software engineers apply computer science principles to design and build reliable, scalable software. The role spans requirements analysis, system design, coding, testing, and deployment across any domain or stack.',
    scope: 'Software Engineering',
    color: '#6366F1',
    orderId: 3,
    isPublished: true,
  },
  {
    title: 'Frontend Developer',
    slug: 'frontend-developer',
    description: 'Build the user-facing layer of web applications using HTML, CSS, JavaScript, and modern frameworks.',
    body: 'Frontend developers translate designs into interactive web interfaces. They work with HTML, CSS, and JavaScript frameworks (React, Angular, Vue), focusing on performance, accessibility, and user experience.',
    scope: 'Web Development',
    color: '#61DAFB',
    orderId: 4,
    isPublished: true,
  },
  {
    title: 'Backend Developer',
    slug: 'backend-developer',
    description: 'Build the server-side logic, APIs, and data layers that power web and mobile applications.',
    body: 'Backend developers design and implement the server side of applications — RESTful and GraphQL APIs, database schemas, authentication, business logic, and infrastructure integration.',
    scope: 'Web Development',
    color: '#68A063',
    orderId: 5,
    isPublished: true,
  },
  {
    title: 'Full Stack Developer',
    slug: 'full-stack-developer',
    description: 'Work across the entire web stack — from UI and APIs to databases and deployment.',
    body: 'Full stack developers own the complete application lifecycle, building both client-side interfaces and server-side services. They bridge frontend and backend to deliver end-to-end product features.',
    scope: 'Web Development',
    color: '#7B68EE',
    orderId: 6,
    isPublished: true,
  },
  {
    title: 'Web Developer',
    slug: 'web-developer',
    description: 'Create websites and web applications with a strong grasp of core web standards and technologies.',
    body: 'Web developers build everything from marketing sites to dynamic web apps, working with HTML, CSS, JavaScript, and a CMS or web framework. They may work frontend-only or across the stack.',
    scope: 'Web Development',
    color: '#4A90D9',
    orderId: 7,
    isPublished: true,
  },

  // ── JavaScript Ecosystem ───────────────────────────────────────────────────
  {
    title: 'React Developer',
    slug: 'react-developer',
    description: 'Build fast, component-based UIs and single-page applications using React and its ecosystem.',
    body: 'React developers specialise in building UI components with React.js, using hooks, state management libraries (Redux, Zustand), and integration patterns with REST or GraphQL APIs.',
    scope: 'JavaScript Ecosystem',
    color: '#00D8FF',
    orderId: 8,
    isPublished: true,
  },
  {
    title: 'Angular Developer',
    slug: 'angular-developer',
    description: 'Build enterprise-scale web applications using Angular, TypeScript, and RxJS.',
    body: 'Angular developers work within Angular\'s opinionated framework, using TypeScript, dependency injection, RxJS observables, and the Angular CLI to build structured, maintainable large-scale apps.',
    scope: 'JavaScript Ecosystem',
    color: '#DD0031',
    orderId: 9,
    isPublished: true,
  },
  {
    title: 'Node.js Developer',
    slug: 'nodejs-developer',
    description: 'Build server-side services and APIs using Node.js and the JavaScript/TypeScript backend ecosystem.',
    body: 'Node.js developers build performant backend services, REST APIs, and microservices using Node.js with frameworks like Express, Fastify, and NestJS, often in a TypeScript-first environment.',
    scope: 'JavaScript Ecosystem',
    color: '#5FA04E',
    orderId: 10,
    isPublished: true,
  },

  // ── Language / Platform Specialists ───────────────────────────────────────
  {
    title: 'Python Developer',
    slug: 'python-developer',
    description: 'Build web backends, APIs, automation tools, and data pipelines using Python.',
    body: "Python developers leverage Python's versatility across web frameworks (Django, FastAPI, Flask), scripting, data processing, and automation. Python is the dominant language in data science and AI tooling.",
    scope: 'Python & Data',
    color: '#3776AB',
    orderId: 11,
    isPublished: true,
  },
  {
    title: 'Java / Spring Boot Developer',
    slug: 'java-springboot-developer',
    description: 'Design and build enterprise-grade Java applications using the Spring Boot framework.',
    body: 'Java Spring Boot developers build scalable enterprise systems and microservices — RESTful APIs, database integration with Spring Data, security with Spring Security, and deployment via containerisation.',
    scope: 'Enterprise Development',
    color: '#F89820',
    orderId: 12,
    isPublished: true,
  },

  // ── Mobile Development ─────────────────────────────────────────────────────
  {
    title: 'Android Developer',
    slug: 'android-developer',
    description: 'Develop native Android applications using Kotlin and the Android SDK.',
    body: 'Android developers build high-quality native apps for the Android platform using Kotlin (or Java), Jetpack libraries, Android SDK, and the Google Play publishing workflow.',
    scope: 'Mobile Development',
    color: '#3DDC84',
    orderId: 13,
    isPublished: true,
  },
  {
    title: 'iOS Developer',
    slug: 'ios-developer',
    description: 'Develop native iOS applications using Swift and Apple\'s development frameworks.',
    body: "iOS developers build polished, performant apps for iPhone and iPad using Swift, UIKit or SwiftUI, and Apple's frameworks, following the Human Interface Guidelines and App Store requirements.",
    scope: 'Mobile Development',
    color: '#147EFB',
    orderId: 14,
    isPublished: true,
  },
  {
    title: 'Mobile App Developer',
    slug: 'mobile-app-developer',
    description: 'Build cross-platform mobile applications that run on both iOS and Android.',
    body: 'Mobile app developers create apps using cross-platform frameworks like Flutter or React Native, delivering consistent experiences across Android and iOS from a shared codebase.',
    scope: 'Mobile Development',
    color: '#5856D6',
    orderId: 15,
    isPublished: true,
  },

  // ── Infrastructure, Cloud & Data ───────────────────────────────────────────
  {
    title: 'DevOps Engineer',
    slug: 'devops-engineer',
    description: 'Automate software delivery pipelines, manage infrastructure, and ensure production reliability.',
    body: 'DevOps engineers bridge development and operations — building CI/CD pipelines, managing infrastructure as code (Terraform, Ansible), containerising workloads with Docker and Kubernetes, and running reliable production systems.',
    scope: 'Infrastructure & DevOps',
    color: '#EE0000',
    orderId: 16,
    isPublished: true,
  },
  {
    title: 'Cloud Engineer',
    slug: 'cloud-engineer',
    description: 'Design and manage cloud infrastructure on AWS, Azure, or GCP for scalable, secure systems.',
    body: 'Cloud engineers architect and operate cloud environments — provisioning compute, storage, and networking resources, designing for high availability, and optimising cost and security on major cloud platforms.',
    scope: 'Cloud & Infrastructure',
    color: '#FF9900',
    orderId: 17,
    isPublished: true,
  },
  {
    title: 'Data Engineer',
    slug: 'data-engineer',
    description: 'Build and maintain data pipelines, warehouses, and infrastructure that power analytics and ML.',
    body: 'Data engineers design and operate the infrastructure for data ingestion, transformation, and serving — ETL pipelines, data lakes, data warehouses (BigQuery, Snowflake, Redshift), and orchestration tools like Airflow.',
    scope: 'Data Engineering',
    color: '#FF6B35',
    orderId: 18,
    isPublished: true,
  },

  // ── AI & Machine Learning ──────────────────────────────────────────────────
  {
    title: 'AI/ML Engineer',
    slug: 'ai-ml-engineer',
    description: 'Design and build end-to-end AI and machine learning systems from data to deployment.',
    body: 'AI/ML engineers work across the full intelligence stack — data preprocessing, model selection and training, evaluation, and production deployment. They bridge data science research and scalable engineering.',
    scope: 'AI & Machine Learning',
    color: '#9333EA',
    orderId: 19,
    isPublished: true,
  },
  {
    title: 'ML Engineer',
    slug: 'ml-engineer',
    description: 'Productionise machine learning models and build the infrastructure to serve them at scale.',
    body: 'ML engineers focus on the engineering side of machine learning — model serving, monitoring, feature stores, A/B testing pipelines, and scalable ML infrastructure. Distinct from data scientists who focus on experimentation.',
    scope: 'AI & Machine Learning',
    color: '#7C3AED',
    orderId: 20,
    isPublished: true,
  },
  {
    title: 'Full Stack Developer (AI-enabled Apps)',
    slug: 'full-stack-dev-ai',
    description: 'Build intelligent full-stack applications that integrate LLMs, embeddings, and AI APIs.',
    body: 'AI-enabled full stack developers combine traditional web engineering with LLM integration, RAG pipelines, vector databases, and AI SDK tooling to build context-aware, intelligent applications.',
    scope: 'AI & Machine Learning',
    color: '#8B5CF6',
    orderId: 21,
    isPublished: true,
  },

  // ── Quality Assurance ──────────────────────────────────────────────────────
  {
    title: 'QA Engineer',
    slug: 'qa-engineer',
    description: 'Own the quality strategy — from test planning and automation to CI integration and defect management.',
    body: 'QA engineers design comprehensive test strategies, write automated test suites (Selenium, Playwright, Cypress), manage regression pipelines, and collaborate closely with developers to catch defects before release.',
    scope: 'Quality Assurance',
    color: '#10B981',
    orderId: 22,
    isPublished: true,
  },
  {
    title: 'Software Tester',
    slug: 'software-tester',
    description: 'Verify software quality through structured manual and exploratory testing.',
    body: 'Software testers ensure applications meet requirements and behave correctly, using functional testing, exploratory testing, regression testing, and basic automation to surface bugs and regressions.',
    scope: 'Quality Assurance',
    color: '#059669',
    orderId: 23,
    isPublished: true,
  },

  // ── Management ─────────────────────────────────────────────────────────────
  {
    title: 'Program Manager',
    slug: 'program-manager',
    description: 'Lead complex software programmes, coordinating engineering teams, timelines, and stakeholder delivery.',
    body: 'Program managers ensure large software initiatives are delivered on time and within scope. They manage cross-team dependencies, track milestones, communicate status to stakeholders, and unblock engineering teams.',
    scope: 'Management',
    color: '#6B7280',
    orderId: 24,
    isPublished: true,
  },

  // ── System (not shown to learners) ────────────────────────────────────────
  {
    title: 'All Developer Roles',
    slug: 'all-devs',
    description: 'System-level role covering foundational skills shared across every developer track.',
    body: 'This role is not a learner selection — it is used internally to associate content that applies universally across all job roles, such as version control and core programming fundamentals.',
    scope: 'Cross-Role',
    color: '#374151',
    orderId: 99,
    isPublished: false,
  },
];

export const JOB_ROLE_SLUGS = JOB_ROLES.map((j) => j.slug);

export async function seedJobRoles(dataSource: DataSource): Promise<JobRole[]> {
  const repo = dataSource.getRepository(JobRole);

  for (const data of JOB_ROLES) {
    const existing = await repo.findOne({ where: { slug: data.slug } });
    if (!existing) {
      await repo.save(repo.create(data));
    } else {
      await repo.update(
        { slug: data.slug },
        {
          title: data.title,
          description: data.description,
          body: data.body,
          scope: data.scope,
          color: data.color,
          orderId: data.orderId,
          isPublished: data.isPublished,
        },
      );
    }
  }

  const jobRoles = await repo.find({ order: { orderId: 'ASC' } });
  console.log(`  ✔ Job Roles: ${jobRoles.length} records`);
  return jobRoles;
}
