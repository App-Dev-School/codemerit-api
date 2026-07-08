import { DataSource } from 'typeorm';
import { SubjectTagEnum } from 'src/common/enum/subject-tag.enum';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { JobRoleSubject } from 'src/common/typeorm/entities/job-role-subject.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';

interface JobRoleSubjectSeed {
  jobRoleSlug: string;
  subjectSlug: string;
  sortOrder: number;
  tag: SubjectTagEnum;
  note?: string;
}

const JOB_ROLE_SUBJECTS: JobRoleSubjectSeed[] = [
  // ── Digital Literacy ─────────────────────────────────────────────────────
  { jobRoleSlug: 'digital-literacy', subjectSlug: 'computer-fundamentals', sortOrder: 1, tag: SubjectTagEnum.MANDATORY,   note: 'Core computer skills for any digital environment' },
  { jobRoleSlug: 'digital-literacy', subjectSlug: 'internet-digital',      sortOrder: 2, tag: SubjectTagEnum.MANDATORY,   note: 'Essential internet and digital communication skills' },
  { jobRoleSlug: 'digital-literacy', subjectSlug: 'microsoft-office',      sortOrder: 3, tag: SubjectTagEnum.RECOMMENDED, note: 'Office tools used in virtually every workplace' },
  { jobRoleSlug: 'digital-literacy', subjectSlug: 'data-entry',            sortOrder: 4, tag: SubjectTagEnum.OPTIONAL,    note: 'Practical productivity and typing skills' },

  // ── Office Professional ───────────────────────────────────────────────────
  { jobRoleSlug: 'office-professional', subjectSlug: 'computer-fundamentals', sortOrder: 1, tag: SubjectTagEnum.MANDATORY,   note: 'Foundation for all office computer work' },
  { jobRoleSlug: 'office-professional', subjectSlug: 'microsoft-office',      sortOrder: 2, tag: SubjectTagEnum.MANDATORY,   note: 'Core office productivity suite' },
  { jobRoleSlug: 'office-professional', subjectSlug: 'data-entry',            sortOrder: 3, tag: SubjectTagEnum.MANDATORY,   note: 'Speed, accuracy, and data management' },
  { jobRoleSlug: 'office-professional', subjectSlug: 'internet-digital',      sortOrder: 4, tag: SubjectTagEnum.RECOMMENDED, note: 'Digital communication for workplace productivity' },
  { jobRoleSlug: 'office-professional', subjectSlug: 'jira',                  sortOrder: 5, tag: SubjectTagEnum.OPTIONAL,    note: 'Workplace task and project tracking awareness' },
  { jobRoleSlug: 'office-professional', subjectSlug: 'relational-databases',  sortOrder: 6, tag: SubjectTagEnum.OPTIONAL,    note: 'Bridging Excel data work with database concepts' },

  // ── Trainee Software Engineer ──────────────────────────────────────────────
  { jobRoleSlug: 'trainee-software-engineer', subjectSlug: 'html',                 sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'The building block of every web page' },
  { jobRoleSlug: 'trainee-software-engineer', subjectSlug: 'css',                  sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Visual styling and layout fundamentals' },
  { jobRoleSlug: 'trainee-software-engineer', subjectSlug: 'javascript',           sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Core programming language of the web' },
  { jobRoleSlug: 'trainee-software-engineer', subjectSlug: 'git',                  sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'Version control for every developer' },
  { jobRoleSlug: 'trainee-software-engineer', subjectSlug: 'typescript',           sortOrder: 5,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Industry standard in modern teams' },
  { jobRoleSlug: 'trainee-software-engineer', subjectSlug: 'rest-apis',            sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'How services communicate' },
  { jobRoleSlug: 'trainee-software-engineer', subjectSlug: 'python',               sortOrder: 7,  tag: SubjectTagEnum.OPTIONAL,     note: 'Great second language for scripting' },
  { jobRoleSlug: 'trainee-software-engineer', subjectSlug: 'relational-databases', sortOrder: 8,  tag: SubjectTagEnum.OPTIONAL,     note: 'Basic SQL for data understanding' },

  // ── Programmer I ──────────────────────────────────────────────────────────
  { jobRoleSlug: 'programmer-1', subjectSlug: 'javascript',           sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Primary language for web development' },
  { jobRoleSlug: 'programmer-1', subjectSlug: 'typescript',           sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Typed JavaScript for professional codebases' },
  { jobRoleSlug: 'programmer-1', subjectSlug: 'html',                 sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Essential for any web-facing work' },
  { jobRoleSlug: 'programmer-1', subjectSlug: 'css',                  sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'Essential for any web-facing work' },
  { jobRoleSlug: 'programmer-1', subjectSlug: 'git',                  sortOrder: 5,  tag: SubjectTagEnum.MANDATORY,    note: 'Team collaboration requires version control' },
  { jobRoleSlug: 'programmer-1', subjectSlug: 'rest-apis',            sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Consuming and building APIs' },
  { jobRoleSlug: 'programmer-1', subjectSlug: 'relational-databases', sortOrder: 7,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Basic data persistence skills' },
  { jobRoleSlug: 'programmer-1', subjectSlug: 'nodejs',               sortOrder: 8,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Server-side JavaScript runtime' },
  { jobRoleSlug: 'programmer-1', subjectSlug: 'react',                sortOrder: 9,  tag: SubjectTagEnum.OPTIONAL,     note: 'Most common UI library in the market' },
  { jobRoleSlug: 'programmer-1', subjectSlug: 'python',               sortOrder: 10, tag: SubjectTagEnum.OPTIONAL,     note: 'Popular alternative language' },

  // ── Software Engineer ─────────────────────────────────────────────────────
  { jobRoleSlug: 'software-engineer', subjectSlug: 'javascript',           sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Lingua franca for web and APIs' },
  { jobRoleSlug: 'software-engineer', subjectSlug: 'typescript',           sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Industry standard for typed JS projects' },
  { jobRoleSlug: 'software-engineer', subjectSlug: 'git',                  sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Baseline skill for every engineer' },
  { jobRoleSlug: 'software-engineer', subjectSlug: 'rest-apis',            sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'Designing and consuming HTTP services' },
  { jobRoleSlug: 'software-engineer', subjectSlug: 'relational-databases', sortOrder: 5,  tag: SubjectTagEnum.MANDATORY,    note: 'Core data layer skill' },
  { jobRoleSlug: 'software-engineer', subjectSlug: 'nodejs',               sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Server-side JavaScript execution' },
  { jobRoleSlug: 'software-engineer', subjectSlug: 'docker',               sortOrder: 7,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Containerisation is now baseline' },
  { jobRoleSlug: 'software-engineer', subjectSlug: 'ci-cd',                sortOrder: 8,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Automated build and deploy pipelines' },
  { jobRoleSlug: 'software-engineer', subjectSlug: 'mongodb',              sortOrder: 9,  tag: SubjectTagEnum.OPTIONAL,     note: 'Common NoSQL alternative' },
  { jobRoleSlug: 'software-engineer', subjectSlug: 'python',               sortOrder: 10, tag: SubjectTagEnum.OPTIONAL,     note: 'Versatile second language' },

  // ── Frontend Developer ────────────────────────────────────────────────────
  { jobRoleSlug: 'frontend-developer', subjectSlug: 'html',           sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Structural foundation of every UI' },
  { jobRoleSlug: 'frontend-developer', subjectSlug: 'css',            sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Visual presentation and responsive design' },
  { jobRoleSlug: 'frontend-developer', subjectSlug: 'javascript',     sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Core language of the browser' },
  { jobRoleSlug: 'frontend-developer', subjectSlug: 'typescript',     sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'Required in virtually all modern frontend jobs' },
  { jobRoleSlug: 'frontend-developer', subjectSlug: 'git',            sortOrder: 5,  tag: SubjectTagEnum.MANDATORY,    note: 'Version control for team delivery' },
  { jobRoleSlug: 'frontend-developer', subjectSlug: 'react',          sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Most in-demand frontend library' },
  { jobRoleSlug: 'frontend-developer', subjectSlug: 'tailwind',       sortOrder: 7,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Dominant utility-first CSS framework' },
  { jobRoleSlug: 'frontend-developer', subjectSlug: 'rest-apis',      sortOrder: 8,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Consuming backend APIs' },
  { jobRoleSlug: 'frontend-developer', subjectSlug: 'graphql',        sortOrder: 9,  tag: SubjectTagEnum.OPTIONAL,     note: 'Increasingly common in frontend data fetching' },
  { jobRoleSlug: 'frontend-developer', subjectSlug: 'nextjs',         sortOrder: 10, tag: SubjectTagEnum.OPTIONAL,     note: 'React framework with SSR/SSG capabilities' },
  { jobRoleSlug: 'frontend-developer', subjectSlug: 'redux',          sortOrder: 11, tag: SubjectTagEnum.OPTIONAL,     note: 'State management for complex apps' },

  // ── Backend Developer ─────────────────────────────────────────────────────
  { jobRoleSlug: 'backend-developer', subjectSlug: 'javascript',           sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Core language for Node.js backends' },
  { jobRoleSlug: 'backend-developer', subjectSlug: 'typescript',           sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Standard in professional backend projects' },
  { jobRoleSlug: 'backend-developer', subjectSlug: 'nodejs',               sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Server-side JS runtime' },
  { jobRoleSlug: 'backend-developer', subjectSlug: 'rest-apis',            sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'Designing and implementing HTTP APIs' },
  { jobRoleSlug: 'backend-developer', subjectSlug: 'relational-databases', sortOrder: 5,  tag: SubjectTagEnum.MANDATORY,    note: 'Data modelling and SQL querying' },
  { jobRoleSlug: 'backend-developer', subjectSlug: 'git',                  sortOrder: 6,  tag: SubjectTagEnum.MANDATORY,    note: 'Version control' },
  { jobRoleSlug: 'backend-developer', subjectSlug: 'expressjs',            sortOrder: 7,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Most widely used Node.js web framework' },
  { jobRoleSlug: 'backend-developer', subjectSlug: 'nest-js',              sortOrder: 8,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Enterprise-grade structured Node.js framework' },
  { jobRoleSlug: 'backend-developer', subjectSlug: 'mongodb',              sortOrder: 9,  tag: SubjectTagEnum.RECOMMENDED,  note: 'NoSQL for flexible schemas' },
  { jobRoleSlug: 'backend-developer', subjectSlug: 'docker',               sortOrder: 10, tag: SubjectTagEnum.RECOMMENDED,  note: 'Containerisation is industry standard' },
  { jobRoleSlug: 'backend-developer', subjectSlug: 'ci-cd',                sortOrder: 11, tag: SubjectTagEnum.RECOMMENDED,  note: 'Automated delivery pipelines' },
  { jobRoleSlug: 'backend-developer', subjectSlug: 'graphql',              sortOrder: 12, tag: SubjectTagEnum.OPTIONAL,     note: 'Alternative to REST for API design' },
  { jobRoleSlug: 'backend-developer', subjectSlug: 'python',               sortOrder: 13, tag: SubjectTagEnum.OPTIONAL,     note: 'Versatile backend language' },

  // ── Full Stack Developer ──────────────────────────────────────────────────
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'html',                 sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Frontend foundation' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'css',                  sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Frontend styling' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'javascript',           sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Both frontend and backend' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'typescript',           sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'Standard in modern full-stack stacks' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'nodejs',               sortOrder: 5,  tag: SubjectTagEnum.MANDATORY,    note: 'Server-side JavaScript' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'relational-databases', sortOrder: 6,  tag: SubjectTagEnum.MANDATORY,    note: 'Data layer proficiency' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'git',                  sortOrder: 7,  tag: SubjectTagEnum.MANDATORY,    note: 'Version control' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'react',                sortOrder: 8,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Most common full-stack frontend choice' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'rest-apis',            sortOrder: 9,  tag: SubjectTagEnum.RECOMMENDED,  note: 'API design from frontend to backend' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'mongodb',              sortOrder: 10, tag: SubjectTagEnum.RECOMMENDED,  note: 'NoSQL for flexible data models' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'docker',               sortOrder: 11, tag: SubjectTagEnum.RECOMMENDED,  note: 'Containerised local and production environments' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'tailwind',             sortOrder: 12, tag: SubjectTagEnum.RECOMMENDED,  note: 'Efficient styling in JS frameworks' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'graphql',              sortOrder: 13, tag: SubjectTagEnum.OPTIONAL,     note: 'Efficient data fetching across the stack' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'nextjs',               sortOrder: 14, tag: SubjectTagEnum.OPTIONAL,     note: 'Full-stack React framework' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'ci-cd',                sortOrder: 15, tag: SubjectTagEnum.OPTIONAL,     note: 'Delivery automation' },

  // ── Web Developer ─────────────────────────────────────────────────────────
  { jobRoleSlug: 'web-developer', subjectSlug: 'html',       sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Foundation of every web page' },
  { jobRoleSlug: 'web-developer', subjectSlug: 'css',        sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Styling and responsive layouts' },
  { jobRoleSlug: 'web-developer', subjectSlug: 'javascript', sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Interactive web behaviour' },
  { jobRoleSlug: 'web-developer', subjectSlug: 'git',        sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'Version control' },
  { jobRoleSlug: 'web-developer', subjectSlug: 'typescript', sortOrder: 5,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Increasingly expected even for web roles' },
  { jobRoleSlug: 'web-developer', subjectSlug: 'react',      sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Most in-demand web UI library' },
  { jobRoleSlug: 'web-developer', subjectSlug: 'nextjs',     sortOrder: 7,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Full-featured web framework' },
  { jobRoleSlug: 'web-developer', subjectSlug: 'tailwind',   sortOrder: 8,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Efficient CSS utility framework' },
  { jobRoleSlug: 'web-developer', subjectSlug: 'rest-apis',  sortOrder: 9,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Working with backend data' },
  { jobRoleSlug: 'web-developer', subjectSlug: 'graphql',    sortOrder: 10, tag: SubjectTagEnum.OPTIONAL,     note: 'Modern data-fetching alternative' },
  { jobRoleSlug: 'web-developer', subjectSlug: 'redux',      sortOrder: 11, tag: SubjectTagEnum.OPTIONAL,     note: 'State management for larger apps' },
  { jobRoleSlug: 'web-developer', subjectSlug: 'vuejs',      sortOrder: 12, tag: SubjectTagEnum.OPTIONAL,     note: 'Popular alternative to React' },

  // ── React Developer ───────────────────────────────────────────────────────
  { jobRoleSlug: 'react-developer', subjectSlug: 'javascript', sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'React is a JS library — JS expertise is mandatory' },
  { jobRoleSlug: 'react-developer', subjectSlug: 'typescript', sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Standard in all React job postings' },
  { jobRoleSlug: 'react-developer', subjectSlug: 'react',      sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Core framework proficiency' },
  { jobRoleSlug: 'react-developer', subjectSlug: 'redux',      sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'State management at scale' },
  { jobRoleSlug: 'react-developer', subjectSlug: 'git',        sortOrder: 5,  tag: SubjectTagEnum.MANDATORY,    note: 'Version control' },
  { jobRoleSlug: 'react-developer', subjectSlug: 'nextjs',     sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'React framework for production apps' },
  { jobRoleSlug: 'react-developer', subjectSlug: 'rest-apis',  sortOrder: 7,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Fetching data from APIs' },
  { jobRoleSlug: 'react-developer', subjectSlug: 'tailwind',   sortOrder: 8,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Dominant styling choice in React ecosystems' },
  { jobRoleSlug: 'react-developer', subjectSlug: 'graphql',    sortOrder: 9,  tag: SubjectTagEnum.OPTIONAL,     note: 'Used alongside React in many projects' },
  { jobRoleSlug: 'react-developer', subjectSlug: 'nodejs',     sortOrder: 10, tag: SubjectTagEnum.OPTIONAL,     note: 'Understanding the backend side' },

  // ── Angular Developer ─────────────────────────────────────────────────────
  { jobRoleSlug: 'angular-developer', subjectSlug: 'javascript', sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Angular builds on JavaScript fundamentals' },
  { jobRoleSlug: 'angular-developer', subjectSlug: 'typescript', sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Angular is TypeScript-first by design' },
  { jobRoleSlug: 'angular-developer', subjectSlug: 'angular',    sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Core framework expertise' },
  { jobRoleSlug: 'angular-developer', subjectSlug: 'rxjs',       sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'Angular reactive programming library' },
  { jobRoleSlug: 'angular-developer', subjectSlug: 'git',        sortOrder: 5,  tag: SubjectTagEnum.MANDATORY,    note: 'Version control' },
  { jobRoleSlug: 'angular-developer', subjectSlug: 'ngrx',       sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'State management for enterprise Angular apps' },
  { jobRoleSlug: 'angular-developer', subjectSlug: 'tailwind',   sortOrder: 7,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Modern styling in Angular projects' },
  { jobRoleSlug: 'angular-developer', subjectSlug: 'rest-apis',  sortOrder: 8,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Backend communication' },
  { jobRoleSlug: 'angular-developer', subjectSlug: 'nodejs',     sortOrder: 9,  tag: SubjectTagEnum.OPTIONAL,     note: 'Understanding the backend' },
  { jobRoleSlug: 'angular-developer', subjectSlug: 'nx-monorepo',sortOrder: 10, tag: SubjectTagEnum.OPTIONAL,     note: 'Monorepo tooling common in Angular enterprise' },

  // ── Node.js Developer ─────────────────────────────────────────────────────
  { jobRoleSlug: 'nodejs-developer', subjectSlug: 'javascript',           sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Node.js is JavaScript on the server' },
  { jobRoleSlug: 'nodejs-developer', subjectSlug: 'typescript',           sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Standard in Node.js projects' },
  { jobRoleSlug: 'nodejs-developer', subjectSlug: 'nodejs',               sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Core runtime proficiency' },
  { jobRoleSlug: 'nodejs-developer', subjectSlug: 'rest-apis',            sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'Building HTTP services' },
  { jobRoleSlug: 'nodejs-developer', subjectSlug: 'relational-databases', sortOrder: 5,  tag: SubjectTagEnum.MANDATORY,    note: 'Data persistence with SQL' },
  { jobRoleSlug: 'nodejs-developer', subjectSlug: 'git',                  sortOrder: 6,  tag: SubjectTagEnum.MANDATORY,    note: 'Version control' },
  { jobRoleSlug: 'nodejs-developer', subjectSlug: 'expressjs',            sortOrder: 7,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Lightweight Node.js web framework' },
  { jobRoleSlug: 'nodejs-developer', subjectSlug: 'nest-js',              sortOrder: 8,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Enterprise-grade Node.js framework' },
  { jobRoleSlug: 'nodejs-developer', subjectSlug: 'mongodb',              sortOrder: 9,  tag: SubjectTagEnum.RECOMMENDED,  note: 'NoSQL option common in Node.js stacks' },
  { jobRoleSlug: 'nodejs-developer', subjectSlug: 'docker',               sortOrder: 10, tag: SubjectTagEnum.RECOMMENDED,  note: 'Containerised Node.js apps' },
  { jobRoleSlug: 'nodejs-developer', subjectSlug: 'graphql',              sortOrder: 11, tag: SubjectTagEnum.OPTIONAL,     note: 'API design alternative' },
  { jobRoleSlug: 'nodejs-developer', subjectSlug: 'ci-cd',                sortOrder: 12, tag: SubjectTagEnum.OPTIONAL,     note: 'Automated deployment pipelines' },

  // ── Python Developer ──────────────────────────────────────────────────────
  { jobRoleSlug: 'python-developer', subjectSlug: 'python',               sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Core language expertise' },
  { jobRoleSlug: 'python-developer', subjectSlug: 'rest-apis',            sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Python is used heavily for API development' },
  { jobRoleSlug: 'python-developer', subjectSlug: 'git',                  sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Version control' },
  { jobRoleSlug: 'python-developer', subjectSlug: 'relational-databases', sortOrder: 4,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Data persistence and SQL queries' },
  { jobRoleSlug: 'python-developer', subjectSlug: 'mongodb',              sortOrder: 5,  tag: SubjectTagEnum.RECOMMENDED,  note: 'NoSQL alternative' },
  { jobRoleSlug: 'python-developer', subjectSlug: 'docker',               sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Containerised Python services' },
  { jobRoleSlug: 'python-developer', subjectSlug: 'ai-fundamentals',      sortOrder: 7,  tag: SubjectTagEnum.OPTIONAL,     note: 'Python is the dominant AI language' },
  { jobRoleSlug: 'python-developer', subjectSlug: 'machine-learning',     sortOrder: 8,  tag: SubjectTagEnum.OPTIONAL,     note: 'Common Python developer growth path' },
  { jobRoleSlug: 'python-developer', subjectSlug: 'ci-cd',                sortOrder: 9,  tag: SubjectTagEnum.OPTIONAL,     note: 'Deployment automation' },

  // ── Java / Spring Boot Developer ──────────────────────────────────────────
  { jobRoleSlug: 'java-springboot-developer', subjectSlug: 'java',                 sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Primary language' },
  { jobRoleSlug: 'java-springboot-developer', subjectSlug: 'spring-boot',          sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Core framework for Java microservices' },
  { jobRoleSlug: 'java-springboot-developer', subjectSlug: 'relational-databases', sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'JPA and SQL are fundamental to Spring apps' },
  { jobRoleSlug: 'java-springboot-developer', subjectSlug: 'rest-apis',            sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'Spring Boot is primarily used for REST services' },
  { jobRoleSlug: 'java-springboot-developer', subjectSlug: 'git',                  sortOrder: 5,  tag: SubjectTagEnum.MANDATORY,    note: 'Version control' },
  { jobRoleSlug: 'java-springboot-developer', subjectSlug: 'docker',               sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Containerised Java services' },
  { jobRoleSlug: 'java-springboot-developer', subjectSlug: 'ci-cd',                sortOrder: 7,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Automated build and release pipelines' },
  { jobRoleSlug: 'java-springboot-developer', subjectSlug: 'mongodb',              sortOrder: 8,  tag: SubjectTagEnum.OPTIONAL,     note: 'NoSQL alternative in Spring ecosystem' },
  { jobRoleSlug: 'java-springboot-developer', subjectSlug: 'kubernetes',           sortOrder: 9,  tag: SubjectTagEnum.OPTIONAL,     note: 'Orchestrating Java microservices at scale' },

  // ── Android Developer ─────────────────────────────────────────────────────
  { jobRoleSlug: 'android-developer', subjectSlug: 'android',              sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Native Android development' },
  { jobRoleSlug: 'android-developer', subjectSlug: 'java',                 sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Traditional Android language' },
  { jobRoleSlug: 'android-developer', subjectSlug: 'git',                  sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Version control' },
  { jobRoleSlug: 'android-developer', subjectSlug: 'rest-apis',            sortOrder: 4,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Mobile apps rely on backend APIs' },
  { jobRoleSlug: 'android-developer', subjectSlug: 'relational-databases', sortOrder: 5,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Local storage with SQLite/Room' },
  { jobRoleSlug: 'android-developer', subjectSlug: 'react-native',         sortOrder: 6,  tag: SubjectTagEnum.OPTIONAL,     note: 'Cross-platform broadens employability' },
  { jobRoleSlug: 'android-developer', subjectSlug: 'ci-cd',                sortOrder: 7,  tag: SubjectTagEnum.OPTIONAL,     note: 'Mobile CI for automated app builds' },

  // ── iOS Developer ─────────────────────────────────────────────────────────
  { jobRoleSlug: 'ios-developer', subjectSlug: 'ios',                  sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Native iOS/Swift/SwiftUI development' },
  { jobRoleSlug: 'ios-developer', subjectSlug: 'git',                  sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Version control' },
  { jobRoleSlug: 'ios-developer', subjectSlug: 'rest-apis',            sortOrder: 3,  tag: SubjectTagEnum.RECOMMENDED,  note: 'iOS apps consume backend APIs' },
  { jobRoleSlug: 'ios-developer', subjectSlug: 'relational-databases', sortOrder: 4,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Core Data and local storage' },
  { jobRoleSlug: 'ios-developer', subjectSlug: 'react-native',         sortOrder: 5,  tag: SubjectTagEnum.OPTIONAL,     note: 'Cross-platform skill for broader market' },
  { jobRoleSlug: 'ios-developer', subjectSlug: 'ci-cd',                sortOrder: 6,  tag: SubjectTagEnum.OPTIONAL,     note: 'Automated App Store delivery pipelines' },

  // ── Mobile App Developer ─────────────────────────────────────────────────
  { jobRoleSlug: 'mobile-app-developer', subjectSlug: 'javascript',    sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Core language for cross-platform mobile' },
  { jobRoleSlug: 'mobile-app-developer', subjectSlug: 'typescript',    sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Standard in React Native projects' },
  { jobRoleSlug: 'mobile-app-developer', subjectSlug: 'react-native',  sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Primary cross-platform mobile framework' },
  { jobRoleSlug: 'mobile-app-developer', subjectSlug: 'git',           sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'Version control' },
  { jobRoleSlug: 'mobile-app-developer', subjectSlug: 'rest-apis',     sortOrder: 5,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Mobile apps rely on backend services' },
  { jobRoleSlug: 'mobile-app-developer', subjectSlug: 'capacitor',     sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Hybrid mobile app runtime' },
  { jobRoleSlug: 'mobile-app-developer', subjectSlug: 'mongodb',       sortOrder: 7,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Flexible backend storage' },
  { jobRoleSlug: 'mobile-app-developer', subjectSlug: 'android',       sortOrder: 8,  tag: SubjectTagEnum.OPTIONAL,     note: 'Native Android deepdive' },
  { jobRoleSlug: 'mobile-app-developer', subjectSlug: 'ios',           sortOrder: 9,  tag: SubjectTagEnum.OPTIONAL,     note: 'Native iOS deepdive' },
  { jobRoleSlug: 'mobile-app-developer', subjectSlug: 'tailwind',      sortOrder: 10, tag: SubjectTagEnum.OPTIONAL,     note: 'CSS utility knowledge for hybrid apps' },

  // ── DevOps Engineer ───────────────────────────────────────────────────────
  { jobRoleSlug: 'devops-engineer', subjectSlug: 'devops',               sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Core DevOps principles and practices' },
  { jobRoleSlug: 'devops-engineer', subjectSlug: 'docker',               sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Container fundamentals' },
  { jobRoleSlug: 'devops-engineer', subjectSlug: 'kubernetes',           sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Container orchestration at scale' },
  { jobRoleSlug: 'devops-engineer', subjectSlug: 'ci-cd',                sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'Automated build/test/deploy pipelines' },
  { jobRoleSlug: 'devops-engineer', subjectSlug: 'git',                  sortOrder: 5,  tag: SubjectTagEnum.MANDATORY,    note: 'Infrastructure as code lives in git' },
  { jobRoleSlug: 'devops-engineer', subjectSlug: 'jenkins',              sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Widely used CI server' },
  { jobRoleSlug: 'devops-engineer', subjectSlug: 'cloud-basics',         sortOrder: 7,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Most DevOps work is cloud-based' },
  { jobRoleSlug: 'devops-engineer', subjectSlug: 'relational-databases', sortOrder: 8,  tag: SubjectTagEnum.OPTIONAL,     note: 'Database admin tasks in DevOps pipelines' },
  { jobRoleSlug: 'devops-engineer', subjectSlug: 'python',               sortOrder: 9,  tag: SubjectTagEnum.OPTIONAL,     note: 'Scripting and automation' },

  // ── Cloud Engineer ────────────────────────────────────────────────────────
  { jobRoleSlug: 'cloud-engineer', subjectSlug: 'cloud-basics',         sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Cloud infrastructure fundamentals' },
  { jobRoleSlug: 'cloud-engineer', subjectSlug: 'docker',               sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Container fundamentals' },
  { jobRoleSlug: 'cloud-engineer', subjectSlug: 'kubernetes',           sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Orchestration on cloud clusters' },
  { jobRoleSlug: 'cloud-engineer', subjectSlug: 'ci-cd',                sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'Cloud delivery pipelines' },
  { jobRoleSlug: 'cloud-engineer', subjectSlug: 'git',                  sortOrder: 5,  tag: SubjectTagEnum.MANDATORY,    note: 'Infrastructure as code' },
  { jobRoleSlug: 'cloud-engineer', subjectSlug: 'devops',               sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'DevOps practices underpin cloud engineering' },
  { jobRoleSlug: 'cloud-engineer', subjectSlug: 'relational-databases', sortOrder: 7,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Managed database services' },
  { jobRoleSlug: 'cloud-engineer', subjectSlug: 'python',               sortOrder: 8,  tag: SubjectTagEnum.OPTIONAL,     note: 'Automation and infrastructure scripting' },
  { jobRoleSlug: 'cloud-engineer', subjectSlug: 'jenkins',              sortOrder: 9,  tag: SubjectTagEnum.OPTIONAL,     note: 'CI server management' },
  { jobRoleSlug: 'cloud-engineer', subjectSlug: 'mongodb',              sortOrder: 10, tag: SubjectTagEnum.OPTIONAL,     note: 'Cloud NoSQL deployments' },

  // ── Data Engineer ─────────────────────────────────────────────────────────
  { jobRoleSlug: 'data-engineer', subjectSlug: 'python',               sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Primary language for data pipelines and ETL' },
  { jobRoleSlug: 'data-engineer', subjectSlug: 'relational-databases', sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'SQL and data warehouse design' },
  { jobRoleSlug: 'data-engineer', subjectSlug: 'mongodb',              sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'NoSQL for unstructured data ingestion' },
  { jobRoleSlug: 'data-engineer', subjectSlug: 'git',                  sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'Version control for pipeline code' },
  { jobRoleSlug: 'data-engineer', subjectSlug: 'cloud-basics',         sortOrder: 5,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Data pipelines are cloud-hosted' },
  { jobRoleSlug: 'data-engineer', subjectSlug: 'rest-apis',            sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Ingesting data from external APIs' },
  { jobRoleSlug: 'data-engineer', subjectSlug: 'docker',               sortOrder: 7,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Containerised data services' },
  { jobRoleSlug: 'data-engineer', subjectSlug: 'machine-learning',     sortOrder: 8,  tag: SubjectTagEnum.OPTIONAL,     note: 'Data engineers often collaborate with ML teams' },
  { jobRoleSlug: 'data-engineer', subjectSlug: 'ci-cd',                sortOrder: 9,  tag: SubjectTagEnum.OPTIONAL,     note: 'Pipeline deployment automation' },

  // ── AI/ML Engineer ────────────────────────────────────────────────────────
  { jobRoleSlug: 'ai-ml-engineer', subjectSlug: 'python',               sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Dominant language in AI/ML' },
  { jobRoleSlug: 'ai-ml-engineer', subjectSlug: 'ai-fundamentals',      sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Foundations of AI concepts and techniques' },
  { jobRoleSlug: 'ai-ml-engineer', subjectSlug: 'machine-learning',     sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Core discipline' },
  { jobRoleSlug: 'ai-ml-engineer', subjectSlug: 'git',                  sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'Version control for models and experiments' },
  { jobRoleSlug: 'ai-ml-engineer', subjectSlug: 'relational-databases', sortOrder: 5,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Training data storage and retrieval' },
  { jobRoleSlug: 'ai-ml-engineer', subjectSlug: 'mongodb',              sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Unstructured training data' },
  { jobRoleSlug: 'ai-ml-engineer', subjectSlug: 'rest-apis',            sortOrder: 7,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Serving models via APIs' },
  { jobRoleSlug: 'ai-ml-engineer', subjectSlug: 'cloud-basics',         sortOrder: 8,  tag: SubjectTagEnum.OPTIONAL,     note: 'Cloud GPU compute for training' },
  { jobRoleSlug: 'ai-ml-engineer', subjectSlug: 'docker',               sortOrder: 9,  tag: SubjectTagEnum.OPTIONAL,     note: 'Containerised model serving' },

  // ── ML Engineer ───────────────────────────────────────────────────────────
  { jobRoleSlug: 'ml-engineer', subjectSlug: 'python',               sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Primary language for ML' },
  { jobRoleSlug: 'ml-engineer', subjectSlug: 'machine-learning',     sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Core specialisation' },
  { jobRoleSlug: 'ml-engineer', subjectSlug: 'git',                  sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Experiment tracking and model versioning' },
  { jobRoleSlug: 'ml-engineer', subjectSlug: 'ai-fundamentals',      sortOrder: 4,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Broad AI context for ML practitioners' },
  { jobRoleSlug: 'ml-engineer', subjectSlug: 'relational-databases', sortOrder: 5,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Structured datasets and feature stores' },
  { jobRoleSlug: 'ml-engineer', subjectSlug: 'cloud-basics',         sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Cloud-based model training and deployment' },
  { jobRoleSlug: 'ml-engineer', subjectSlug: 'docker',               sortOrder: 7,  tag: SubjectTagEnum.OPTIONAL,     note: 'Containerised model pipelines' },
  { jobRoleSlug: 'ml-engineer', subjectSlug: 'mongodb',              sortOrder: 8,  tag: SubjectTagEnum.OPTIONAL,     note: 'Unstructured data for training' },

  // ── Full Stack Developer (AI-enabled) ─────────────────────────────────────
  { jobRoleSlug: 'full-stack-dev-ai', subjectSlug: 'javascript',           sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Frontend and Node.js backend' },
  { jobRoleSlug: 'full-stack-dev-ai', subjectSlug: 'typescript',           sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Modern full-stack standard' },
  { jobRoleSlug: 'full-stack-dev-ai', subjectSlug: 'nodejs',               sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Backend runtime for AI-enabled APIs' },
  { jobRoleSlug: 'full-stack-dev-ai', subjectSlug: 'ai-fundamentals',      sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'AI concepts for integrating LLM/ML features' },
  { jobRoleSlug: 'full-stack-dev-ai', subjectSlug: 'git',                  sortOrder: 5,  tag: SubjectTagEnum.MANDATORY,    note: 'Version control' },
  { jobRoleSlug: 'full-stack-dev-ai', subjectSlug: 'react',                sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Most common full-stack frontend' },
  { jobRoleSlug: 'full-stack-dev-ai', subjectSlug: 'relational-databases', sortOrder: 7,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Data persistence for AI-enriched apps' },
  { jobRoleSlug: 'full-stack-dev-ai', subjectSlug: 'python',               sortOrder: 8,  tag: SubjectTagEnum.RECOMMENDED,  note: 'AI/ML scripting and model integration' },
  { jobRoleSlug: 'full-stack-dev-ai', subjectSlug: 'rest-apis',            sortOrder: 9,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Consuming AI model APIs' },
  { jobRoleSlug: 'full-stack-dev-ai', subjectSlug: 'machine-learning',     sortOrder: 10, tag: SubjectTagEnum.OPTIONAL,     note: 'ML concepts for building smarter features' },
  { jobRoleSlug: 'full-stack-dev-ai', subjectSlug: 'mongodb',              sortOrder: 11, tag: SubjectTagEnum.OPTIONAL,     note: 'Document store for AI app data' },
  { jobRoleSlug: 'full-stack-dev-ai', subjectSlug: 'docker',               sortOrder: 12, tag: SubjectTagEnum.OPTIONAL,     note: 'Containerised AI services' },

  // ── QA Engineer ───────────────────────────────────────────────────────────
  { jobRoleSlug: 'qa-engineer', subjectSlug: 'software-testing', sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Core testing theory and methodology' },
  { jobRoleSlug: 'qa-engineer', subjectSlug: 'javascript',       sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Cypress and most modern test frameworks use JS' },
  { jobRoleSlug: 'qa-engineer', subjectSlug: 'cypress',          sortOrder: 3,  tag: SubjectTagEnum.MANDATORY,    note: 'Leading E2E testing framework' },
  { jobRoleSlug: 'qa-engineer', subjectSlug: 'git',              sortOrder: 4,  tag: SubjectTagEnum.MANDATORY,    note: 'Managing test suites in version control' },
  { jobRoleSlug: 'qa-engineer', subjectSlug: 'java-selenium',    sortOrder: 5,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Traditional automation testing framework' },
  { jobRoleSlug: 'qa-engineer', subjectSlug: 'jira',             sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Bug tracking and test case management' },
  { jobRoleSlug: 'qa-engineer', subjectSlug: 'rest-apis',        sortOrder: 7,  tag: SubjectTagEnum.RECOMMENDED,  note: 'API testing with tools like Postman' },
  { jobRoleSlug: 'qa-engineer', subjectSlug: 'python',           sortOrder: 8,  tag: SubjectTagEnum.OPTIONAL,     note: 'Python-based test automation (pytest)' },
  { jobRoleSlug: 'qa-engineer', subjectSlug: 'ci-cd',            sortOrder: 9,  tag: SubjectTagEnum.OPTIONAL,     note: 'Integrating tests in build pipelines' },

  // ── Software Tester ───────────────────────────────────────────────────────
  { jobRoleSlug: 'software-tester', subjectSlug: 'software-testing', sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Testing fundamentals and methodologies' },
  { jobRoleSlug: 'software-tester', subjectSlug: 'git',              sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Version control for test scripts' },
  { jobRoleSlug: 'software-tester', subjectSlug: 'java-selenium',    sortOrder: 3,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Selenium WebDriver with Java' },
  { jobRoleSlug: 'software-tester', subjectSlug: 'cypress',          sortOrder: 4,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Modern browser automation' },
  { jobRoleSlug: 'software-tester', subjectSlug: 'jira',             sortOrder: 5,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Bug and test case tracking' },
  { jobRoleSlug: 'software-tester', subjectSlug: 'javascript',       sortOrder: 6,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Required for Cypress test scripts' },
  { jobRoleSlug: 'software-tester', subjectSlug: 'rest-apis',        sortOrder: 7,  tag: SubjectTagEnum.OPTIONAL,     note: 'API testing skills' },
  { jobRoleSlug: 'software-tester', subjectSlug: 'ci-cd',            sortOrder: 8,  tag: SubjectTagEnum.OPTIONAL,     note: 'Running tests in pipelines' },

  // ── Program Manager ───────────────────────────────────────────────────────
  { jobRoleSlug: 'program-manager', subjectSlug: 'jira',             sortOrder: 1,  tag: SubjectTagEnum.MANDATORY,    note: 'Project tracking and sprint management' },
  { jobRoleSlug: 'program-manager', subjectSlug: 'git',              sortOrder: 2,  tag: SubjectTagEnum.MANDATORY,    note: 'Understanding version control and releases' },
  { jobRoleSlug: 'program-manager', subjectSlug: 'rest-apis',        sortOrder: 3,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Understanding how APIs work aids technical communication' },
  { jobRoleSlug: 'program-manager', subjectSlug: 'software-testing', sortOrder: 4,  tag: SubjectTagEnum.RECOMMENDED,  note: 'Understanding QA processes' },
  { jobRoleSlug: 'program-manager', subjectSlug: 'ci-cd',            sortOrder: 5,  tag: SubjectTagEnum.OPTIONAL,     note: 'Familiarity with delivery pipeline health' },

  // ── All Developer Roles ───────────────────────────────────────────────────
  { jobRoleSlug: 'all-devs', subjectSlug: 'git',  sortOrder: 1, tag: SubjectTagEnum.MANDATORY, note: 'Universal developer baseline' },
  { jobRoleSlug: 'all-devs', subjectSlug: 'jira', sortOrder: 2, tag: SubjectTagEnum.MANDATORY, note: 'Universal project tracking baseline' },
];

export async function seedJobRoleSubjects(
  dataSource: DataSource,
  jobRoles: JobRole[],
  subjects: Subject[],
): Promise<void> {
  const repo = dataSource.getRepository(JobRoleSubject);
  const jobRoleMap = new Map(jobRoles.map((j) => [j.slug, j]));
  const subjectMap = new Map(subjects.map((s) => [s.slug, s]));

  // Destructive: clear all existing links and rebuild from this file
  await dataSource.query('DELETE FROM job_role_subject');

  let inserted = 0;
  let skipped  = 0;

  for (const data of JOB_ROLE_SUBJECTS) {
    const jobRole = jobRoleMap.get(data.jobRoleSlug);
    const subject = subjectMap.get(data.subjectSlug);

    if (!jobRole) { console.warn(`  ⚠  Unknown job role slug: "${data.jobRoleSlug}" — skipped`); skipped++; continue; }
    if (!subject) { console.warn(`  ⚠  Unknown subject slug: "${data.subjectSlug}" — skipped`);  skipped++; continue; }

    await repo.save(
      repo.create({
        jobRoleId: jobRole.id,
        subjectId: subject.id,
        sortOrder: data.sortOrder,
        tag:       data.tag,
        note:      data.note ?? null,
      }),
    );
    inserted++;
  }

  console.log(`  ✔ Job Role Subjects: ${inserted} links inserted${skipped ? `, ${skipped} skipped (unknown slug)` : ''}`);
}
