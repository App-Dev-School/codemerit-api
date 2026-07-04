import { DataSource } from 'typeorm';
import { CertificationTrack } from 'src/common/typeorm/entities/certification-track.entity';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';

interface CertTrackSeed {
  jobRoleSlug: string;
  title: string;
  description: string;
  sortOrder: number;
  isPublished: boolean;
}

/**
 * Certification tracks per job role.
 *
 * Each track name describes what the learner BECOMES or EARNS — not just a
 * subject/level label. sortOrder defines the recommended progression sequence
 * within a role. Tracks intentionally share names across roles (e.g.
 * "JavaScript Programmer") — the unique constraint is [jobRoleId + title].
 *
 * Coverage map:
 *  programmer-1              → HTML, CSS, JS basics          (4 tracks)
 *  trainee-software-engineer → Git, HTML, JS foundations     (4 tracks)
 *  software-engineer         → Git, JS, engineering basics   (3 tracks)
 *  web-developer             → HTML, CSS, JS professional    (4 tracks)
 *  frontend-developer        → HTML, CSS, JS intermediate    (4 tracks)
 *  react-developer           → JS → React progression        (4 tracks)
 *  angular-developer         → JS → Angular progression      (4 tracks)
 *  nodejs-developer          → JS → Node.js backend          (3 tracks)
 *  full-stack-developer      → Web stack + full-stack cert   (4 tracks)
 *  java-springboot-developer → Java foundations → backend    (3 tracks)
 *  devops-engineer           → Git → DevOps readiness        (3 tracks)
 */
const CERTIFICATION_TRACKS: CertTrackSeed[] = [

  // ── Digital Literacy ──────────────────────────────────────────────────────
  // Target: Absolute beginners — first-time computer users, everyday digital skills.
  {
    jobRoleSlug: 'digital-literacy',
    title: 'Computer Ready',
    sortOrder: 1,
    isPublished: true,
    description:
      'You can use a computer independently. You know your way around the operating system, manage files and folders with confidence, handle hardware basics, and solve everyday problems without needing help.',
  },
  {
    jobRoleSlug: 'digital-literacy',
    title: 'Digitally Connected',
    sortOrder: 2,
    isPublished: true,
    description:
      'You are at home on the internet. You browse with confidence, manage email professionally, store and share files in the cloud, and communicate safely across digital channels.',
  },

  // ── Office Professional ───────────────────────────────────────────────────
  // Target: DCA-level learner who works in an office environment.
  {
    jobRoleSlug: 'office-professional',
    title: 'Office Starter',
    sortOrder: 1,
    isPublished: true,
    description:
      'You produce professional documents and basic spreadsheets. Word lets you create formatted reports and letters; Excel handles your numbers with basic formulas. You are ready for the modern office.',
  },
  {
    jobRoleSlug: 'office-professional',
    title: 'Office Proficient',
    sortOrder: 2,
    isPublished: true,
    description:
      'Microsoft Office is your toolkit. You write polished Word documents, build data-driven Excel spreadsheets with formulas, functions, and charts, and present ideas compellingly with PowerPoint. You work at a professional level.',
  },
  {
    jobRoleSlug: 'office-professional',
    title: 'Data Entry Specialist',
    sortOrder: 3,
    isPublished: true,
    description:
      'Speed and accuracy are your strengths. You enter, clean, and manage data efficiently — keyboard shortcuts, Excel formulas, data validation, and consistent formatting standards — all without missing a beat.',
  },
  {
    jobRoleSlug: 'office-professional',
    title: 'Digital Office Expert',
    sortOrder: 4,
    isPublished: true,
    description:
      'You are the complete digital office professional. Office tools, internet productivity, email management, digital communication, and data accuracy — you handle every computer task a modern workplace needs.',
  },
  {
    jobRoleSlug: 'office-professional',
    title: 'Computer Applications Professional',
    sortOrder: 5,
    isPublished: true,
    description:
      'This is your DCA-equivalent credential. You have mastered everything a Computer Applications Professional needs — computer operations, office productivity, internet skills, and data management. You are ready for any office computing role.',
  },

  // ── Programmer Level 1 ────────────────────────────────────────────────────
  // Target: Someone just starting to code. Small wins, fast feedback.
  {
    jobRoleSlug: 'programmer-1',
    title: 'HTML Aware',
    sortOrder: 1,
    isPublished: true,
    description:
      'You know how the web is built. You write clean, structured HTML — semantic elements, forms, tables, images, links — and you understand why well-formed markup matters for browsers, search engines, and accessibility.',
  },
  {
    jobRoleSlug: 'programmer-1',
    title: 'CSS Aware',
    sortOrder: 2,
    isPublished: true,
    description:
      'You can style a web page. Selectors, the box model, colours, typography, and basic layout — you understand how CSS transforms plain HTML into something visual and presentable.',
  },
  {
    jobRoleSlug: 'programmer-1',
    title: 'JavaScript Starter',
    sortOrder: 3,
    isPublished: true,
    description:
      "You've written real JavaScript. Variables, functions, control flow, arrays, objects, and basic DOM manipulation — you can make a web page respond to user actions and think programmatically.",
  },
  {
    jobRoleSlug: 'programmer-1',
    title: 'Junior Web Programmer',
    sortOrder: 4,
    isPublished: true,
    description:
      'Your first complete web credential. You build structured pages with HTML, style them with CSS, and add logic and interactivity with JavaScript. You are ready to grow into a professional developer.',
  },

  // ── Trainee Software Engineer ─────────────────────────────────────────────
  // Target: Career-changer or school leaver entering software engineering.
  {
    jobRoleSlug: 'trainee-software-engineer',
    title: 'Git Fluent',
    sortOrder: 1,
    isPublished: true,
    description:
      'You collaborate with Git the way professionals do. Branching, merging, resolving conflicts, working with remotes, and writing meaningful commit messages are second nature to you.',
  },
  {
    jobRoleSlug: 'trainee-software-engineer',
    title: 'HTML Aware',
    sortOrder: 2,
    isPublished: true,
    description:
      'You know how web content is structured. You write semantic, accessible HTML and understand how markup connects to CSS and JavaScript to form a complete web page.',
  },
  {
    jobRoleSlug: 'trainee-software-engineer',
    title: 'JavaScript Starter',
    sortOrder: 3,
    isPublished: true,
    description:
      'You think like a programmer. Variables, functions, loops, conditionals, and basic data structures in JavaScript — you write code that solves problems, not just code that runs.',
  },
  {
    jobRoleSlug: 'trainee-software-engineer',
    title: 'Tech Foundations',
    sortOrder: 4,
    isPublished: true,
    description:
      'You have the core toolkit every engineer starts with: professional version control, web structure, and programming logic. You are ready to specialise and grow into any software engineering path.',
  },

  // ── Software Engineer ─────────────────────────────────────────────────────
  // Target: General engineering role. Breadth first, then depth.
  {
    jobRoleSlug: 'software-engineer',
    title: 'Git Fluent',
    sortOrder: 1,
    isPublished: true,
    description:
      'Version control is non-negotiable in professional software engineering. You use Git fluently — branching strategies, rebasing, pull requests, and remote collaboration are all part of your workflow.',
  },
  {
    jobRoleSlug: 'software-engineer',
    title: 'JavaScript Programmer',
    sortOrder: 2,
    isPublished: true,
    description:
      "JavaScript is the lingua franca of modern software. You write clean, well-structured JavaScript — closures, async/await, array methods, modules — and you understand why the code behaves the way it does.",
  },
  {
    jobRoleSlug: 'software-engineer',
    title: 'Software Engineering Foundations',
    sortOrder: 3,
    isPublished: true,
    description:
      'You have the core competencies that all software engineers share — professional version control, programming fundamentals, and an understanding of how web systems are built. A solid base for any specialisation.',
  },

  // ── Web Developer ─────────────────────────────────────────────────────────
  // Target: Someone building websites and web apps professionally.
  {
    jobRoleSlug: 'web-developer',
    title: 'HTML Developer',
    sortOrder: 1,
    isPublished: true,
    description:
      'You write production-quality HTML. Semantic structure, ARIA attributes, accessible forms, multimedia embedding, SEO-friendly markup — you know how to build web content that works for everyone.',
  },
  {
    jobRoleSlug: 'web-developer',
    title: 'CSS Stylist',
    sortOrder: 2,
    isPublished: true,
    description:
      'You style pages like a professional. Flexbox, Grid, responsive design, media queries, custom properties, and scalable CSS architecture — you turn designs into living, breathing web experiences.',
  },
  {
    jobRoleSlug: 'web-developer',
    title: 'JavaScript Programmer',
    sortOrder: 3,
    isPublished: true,
    description:
      'JavaScript is your tool for bringing web pages to life. You handle DOM manipulation, events, async data fetching, local storage, and ES6+ patterns with confidence.',
  },
  {
    jobRoleSlug: 'web-developer',
    title: 'Certified Web Developer',
    sortOrder: 4,
    isPublished: true,
    description:
      'You are a web developer. You design page structure, apply professional CSS, and implement dynamic features with JavaScript. You build complete web experiences that are functional, styled, and interactive.',
  },

  // ── Frontend Developer ────────────────────────────────────────────────────
  // Target: UI-focused engineer building component-driven interfaces.
  {
    jobRoleSlug: 'frontend-developer',
    title: 'HTML Intermediate',
    sortOrder: 1,
    isPublished: true,
    description:
      'Your HTML goes beyond the basics. You write semantic, accessible markup — ARIA roles, advanced form patterns, metadata, and the full HTML5 feature set — and you understand how it impacts SEO and assistive technology.',
  },
  {
    jobRoleSlug: 'frontend-developer',
    title: 'CSS Intermediate',
    sortOrder: 2,
    isPublished: true,
    description:
      "You're past copy-paste CSS. Flexbox and Grid layouts, responsive breakpoints, CSS custom properties, animations, and scalable architecture patterns like BEM — you write CSS that is consistent, maintainable, and precise.",
  },
  {
    jobRoleSlug: 'frontend-developer',
    title: 'JavaScript Programmer',
    sortOrder: 3,
    isPublished: true,
    description:
      'Interactive UIs are your domain. You write clean JavaScript — closures, event handling, async patterns, module imports, and robust DOM interaction — and you know how it all fits together in a browser environment.',
  },
  {
    jobRoleSlug: 'frontend-developer',
    title: 'Expert UI Developer',
    sortOrder: 4,
    isPublished: true,
    description:
      'You build polished, complete user interfaces from scratch. Semantic HTML, precision CSS, and expressive JavaScript — working together. You think in components, care about accessibility, and deliver UIs that work for real users.',
  },

  // ── React Developer ───────────────────────────────────────────────────────
  // Target: Component-based UI engineer focused on the React ecosystem.
  {
    jobRoleSlug: 'react-developer',
    title: 'JavaScript Programmer',
    sortOrder: 1,
    isPublished: true,
    description:
      'React is JavaScript — and you know JavaScript well. Closures, the event loop, promises, array methods, modules, and ES6+ syntax are all familiar. You are ready to move into React with a real foundation.',
  },
  {
    jobRoleSlug: 'react-developer',
    title: 'React Starter',
    sortOrder: 2,
    isPublished: true,
    description:
      'You have built your first React applications. You understand the component model, JSX, props, state with useState, and side effects with useEffect. You can render lists, handle forms, and navigate between pages.',
  },
  {
    jobRoleSlug: 'react-developer',
    title: 'React Developer',
    sortOrder: 3,
    isPublished: true,
    description:
      'React is your framework. You build full applications — custom hooks, context API, React Router, API integration with fetch or Axios, and controlled vs uncontrolled components. Your code is clean and predictable.',
  },
  {
    jobRoleSlug: 'react-developer',
    title: 'React Expert',
    sortOrder: 4,
    isPublished: true,
    description:
      'You write production-grade React. Performance patterns (memo, useMemo, useCallback), global state with Redux or Zustand, code splitting, error boundaries, and testing with React Testing Library — you ship React apps that scale.',
  },

  // ── Angular Developer ─────────────────────────────────────────────────────
  // Target: Enterprise frontend engineer in the Angular ecosystem.
  {
    jobRoleSlug: 'angular-developer',
    title: 'JavaScript Programmer',
    sortOrder: 1,
    isPublished: true,
    description:
      'Angular is built on TypeScript and JavaScript — and you understand both. You write clean, modern JavaScript and you are comfortable with async programming, modules, and object-oriented patterns.',
  },
  {
    jobRoleSlug: 'angular-developer',
    title: 'Angular Starter',
    sortOrder: 2,
    isPublished: true,
    description:
      'You have taken your first real steps in Angular. You understand how Angular applications are structured, build components with templates, use property and event binding, and navigate between routes.',
  },
  {
    jobRoleSlug: 'angular-developer',
    title: 'Angular Developer',
    sortOrder: 3,
    isPublished: true,
    description:
      'Angular is your framework. You build modular applications with components, injectable services, reactive forms, HTTP client integration, and clean routing architectures. You are productive in the Angular ecosystem.',
  },
  {
    jobRoleSlug: 'angular-developer',
    title: 'Angular Expert',
    sortOrder: 4,
    isPublished: true,
    description:
      "You architect Angular applications at scale. Change detection strategies, lazy loading, custom directives, advanced RxJS patterns, performance optimisation, and NgRx state management — Angular holds no secrets from you.",
  },

  // ── Node.js Developer ─────────────────────────────────────────────────────
  // Target: Backend JavaScript engineer building APIs and services.
  {
    jobRoleSlug: 'nodejs-developer',
    title: 'JavaScript Programmer',
    sortOrder: 1,
    isPublished: true,
    description:
      'Node.js is JavaScript on the server — and your JavaScript is solid. Closures, async/await, Promises, modules, and the event-driven model are things you understand deeply, not just use.',
  },
  {
    jobRoleSlug: 'nodejs-developer',
    title: 'Node.js Developer',
    sortOrder: 2,
    isPublished: true,
    description:
      'You build server-side applications with Node.js. RESTful APIs, middleware patterns, error handling, async processing, npm package management, and connecting to databases — you write backends that work.',
  },
  {
    jobRoleSlug: 'nodejs-developer',
    title: 'Backend JavaScript Expert',
    sortOrder: 3,
    isPublished: true,
    description:
      'You are a Node.js professional. You design scalable APIs, handle authentication and security, understand the async model deeply, write structured TypeScript backends, and ship services that go to production.',
  },

  // ── Full Stack Developer ──────────────────────────────────────────────────
  // Target: Developer who owns the complete web application stack.
  {
    jobRoleSlug: 'full-stack-developer',
    title: 'The Web Essentials',
    sortOrder: 1,
    isPublished: true,
    description:
      'You have the three pillars of the web working together. Clean HTML structure, styled with CSS, made interactive with JavaScript — you understand how they interconnect and can build real web pages from scratch.',
  },
  {
    jobRoleSlug: 'full-stack-developer',
    title: 'JavaScript Programmer',
    sortOrder: 2,
    isPublished: true,
    description:
      'JavaScript runs everywhere in full-stack development — in the browser and on the server. You write proficient, modern JavaScript and are ready to use it across the entire application stack.',
  },
  {
    jobRoleSlug: 'full-stack-developer',
    title: 'Full Stack JavaScript Developer',
    sortOrder: 3,
    isPublished: true,
    description:
      'You build complete web applications. Your JavaScript runs on both the browser and the server, you connect frontend to backend, handle data persistence, and understand the complete request-response lifecycle.',
  },
  {
    jobRoleSlug: 'full-stack-developer',
    title: 'Certified Full Stack Developer',
    sortOrder: 4,
    isPublished: true,
    description:
      'You are a certified full stack developer. From database schema design to RESTful APIs to polished frontends — you deliver complete, production-ready web applications and own the full engineering process.',
  },

  // ── Java / Spring Boot Developer ──────────────────────────────────────────
  // Target: Backend engineer focused on Java enterprise development.
  {
    jobRoleSlug: 'java-springboot-developer',
    title: 'Java Programmer',
    sortOrder: 1,
    isPublished: true,
    description:
      'Java is your language. You write object-oriented programs, understand classes, interfaces, inheritance, generics, collections, and the Java standard library. You solve problems with Java the way it was designed to be used.',
  },
  {
    jobRoleSlug: 'java-springboot-developer',
    title: 'Java Developer',
    sortOrder: 2,
    isPublished: true,
    description:
      'You are an intermediate Java developer. Exception handling, multithreading, file I/O, advanced OOP design patterns, JVM internals, and the broader Java ecosystem are part of your professional toolkit.',
  },
  {
    jobRoleSlug: 'java-springboot-developer',
    title: 'Java Backend Developer',
    sortOrder: 3,
    isPublished: true,
    description:
      'You build enterprise-grade Java backends. Spring Boot, RESTful API design, Spring Data JPA for database access, Spring Security for authentication and authorisation — you write Java applications that are ready for production at scale.',
  },

  // ── Tailwind CSS — Frontend Developer ────────────────────────────────────
  // Tailwind tracks sit after the core HTML/CSS/JS certs (sortOrder 5–6)
  {
    jobRoleSlug: 'frontend-developer',
    title: 'Tailwind Aware',
    sortOrder: 5,
    isPublished: true,
    description:
      'You know Tailwind. You understand the utility-first approach, can set up a project, apply core layout and spacing utilities, and build responsive interfaces without writing a line of custom CSS.',
  },
  {
    jobRoleSlug: 'frontend-developer',
    title: 'Tailwind UI Developer',
    sortOrder: 6,
    isPublished: true,
    description:
      'Tailwind is your styling system. You compose interactive, dark-mode-ready UIs with state variants, a consistent typography system, and reusable component patterns — all without leaving your markup.',
  },

  // ── Tailwind CSS — Web Developer ──────────────────────────────────────────
  {
    jobRoleSlug: 'web-developer',
    title: 'Tailwind Aware',
    sortOrder: 5,
    isPublished: true,
    description:
      'You can build websites with Tailwind CSS. The utility-first model, responsive prefixes, and core layout classes are second nature — you ship styled, responsive pages faster than with any traditional stylesheet.',
  },
  {
    jobRoleSlug: 'web-developer',
    title: 'Tailwind UI Developer',
    sortOrder: 6,
    isPublished: true,
    description:
      'You build complete, polished web UIs with Tailwind. State-driven styles, dark mode, typography tuning, and @apply-based component extraction — you use Tailwind at a professional, production level.',
  },

  // ── Tailwind CSS — React Developer ────────────────────────────────────────
  {
    jobRoleSlug: 'react-developer',
    title: 'Tailwind Aware',
    sortOrder: 5,
    isPublished: true,
    description:
      'You pair Tailwind with React effectively. Utility classes in JSX, responsive component design, and dark mode toggling via class strategy — you style React applications the modern, productive way.',
  },

  // ── Tailwind CSS — Angular Developer ─────────────────────────────────────
  {
    jobRoleSlug: 'angular-developer',
    title: 'Tailwind Aware',
    sortOrder: 5,
    isPublished: true,
    description:
      'You integrate Tailwind CSS with Angular projects. You configure Tailwind alongside Angular\'s style encapsulation and build responsive, utility-driven Angular component templates.',
  },

  // ── Tailwind CSS — Full Stack Developer ───────────────────────────────────
  {
    jobRoleSlug: 'full-stack-developer',
    title: 'Tailwind Aware',
    sortOrder: 5,
    isPublished: true,
    description:
      'You use Tailwind across your full-stack projects. Fast, responsive, utility-first frontend styling is part of your complete application development workflow.',
  },

  // ── DevOps Engineer ───────────────────────────────────────────────────────
  // Target: Engineer focused on delivery pipelines and operational reliability.
  {
    jobRoleSlug: 'devops-engineer',
    title: 'Git Fluent',
    sortOrder: 1,
    isPublished: true,
    description:
      'Git is the gateway to DevOps. You use it like a professional — branching strategies, tagging releases, automation via hooks, resolving complex merge conflicts, and maintaining a clean, auditable repository history.',
  },
  {
    jobRoleSlug: 'devops-engineer',
    title: 'Git Power User',
    sortOrder: 2,
    isPublished: true,
    description:
      'You push Git to its limits. Interactive rebasing, bisect, reflog, stash workflows, custom aliases, and repository automation — you are the person the team calls when Git gets complicated.',
  },
  {
    jobRoleSlug: 'devops-engineer',
    title: 'DevOps Foundations',
    sortOrder: 3,
    isPublished: true,
    description:
      'You understand the engineering side of operations. From version control workflows and branching strategies to CI/CD pipeline concepts and infrastructure automation — you know how reliable software gets shipped.',
  },
];

export async function seedCertificationTracks(
  dataSource: DataSource,
  jobRoles: JobRole[],
): Promise<CertificationTrack[]> {
  const repo = dataSource.getRepository(CertificationTrack);
  const jobRoleMap = new Map(jobRoles.map((j) => [j.slug, j]));

  // Clear previous data — disable FK checks, delete in order, re-enable
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  await dataSource.query('DELETE FROM certification_track_subject_track');
  await dataSource.query('DELETE FROM certification_track');
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

  for (const data of CERTIFICATION_TRACKS) {
    const jobRole = jobRoleMap.get(data.jobRoleSlug);
    if (!jobRole) continue;

    await repo.save(
      repo.create({
        jobRoleId: jobRole.id,
        title: data.title,
        description: data.description,
        sortOrder: data.sortOrder,
        isPublished: data.isPublished,
      }),
    );
  }

  const allTracks = await repo.find({ order: { jobRoleId: 'ASC', sortOrder: 'ASC' } });
  console.log(`  ✔ Certification Tracks: ${allTracks.length} records`);
  return allTracks;
}

export { CERTIFICATION_TRACKS };
