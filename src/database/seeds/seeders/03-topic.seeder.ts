import { In, DataSource } from 'typeorm';
import { TopicLabelEnum } from 'src/common/enum/topic-label.enum';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';

interface TopicSeed {
  title: string;
  slug: string;
  subjectSlug: string;
  label: TopicLabelEnum;
  order: number;
  weight: number;
  shortDesc: string;
  description: string;
  isPublished: boolean;
}

const TOPICS: TopicSeed[] = [
  // JavaScript
  { subjectSlug: 'javascript', title: 'Variables & Scope', slug: 'js-variables-scope', label: TopicLabelEnum.Foundation, order: 1, weight: 1, shortDesc: 'var, let, const, scope', description: 'Covers variable declaration with var, let, and const, along with lexical scoping, block scope, and the temporal dead zone.', isPublished: true },
  { subjectSlug: 'javascript', title: 'Functions & Closures', slug: 'js-functions-closures', label: TopicLabelEnum.Foundation, order: 2, weight: 1, shortDesc: 'Functions, closures, IIFE', description: 'Explores function declarations, expressions, arrow functions, closures, and immediately invoked function expressions (IIFE).', isPublished: true },
  { subjectSlug: 'javascript', title: 'Promises & Async/Await', slug: 'js-promises-async', label: TopicLabelEnum.Intermediate, order: 3, weight: 2, shortDesc: 'Async programming patterns', description: 'Covers Promises, the async/await syntax, error handling in async code, and the difference between sequential and parallel execution.', isPublished: true },
  { subjectSlug: 'javascript', title: 'Event Loop', slug: 'js-event-loop', label: TopicLabelEnum.Intermediate, order: 4, weight: 2, shortDesc: 'Call stack, task queue', description: 'Deep dive into how JavaScript\'s single-threaded event loop works, including the call stack, micro-task queue, and macro-task queue.', isPublished: true },
  { subjectSlug: 'javascript', title: 'Prototype & Inheritance', slug: 'js-prototype-inheritance', label: TopicLabelEnum.Advanced, order: 5, weight: 3, shortDesc: 'Prototype chain, OOP', description: 'Explains JavaScript\'s prototype-based inheritance model, prototype chains, Object.create(), and the class syntax as syntactic sugar.', isPublished: true },
  { subjectSlug: 'javascript', title: 'ES6+ Features', slug: 'js-es6-features', label: TopicLabelEnum.Intermediate, order: 6, weight: 2, shortDesc: 'Modern JS syntax', description: 'Covers modern JavaScript features including destructuring, spread/rest operators, template literals, optional chaining, and nullish coalescing.', isPublished: true },
  { subjectSlug: 'javascript', title: 'DOM Manipulation', slug: 'js-dom-manipulation', label: TopicLabelEnum.Foundation, order: 7, weight: 1, shortDesc: 'DOM API, events', description: 'Introduces the Document Object Model, element selection, event handling, and dynamic DOM updates using vanilla JavaScript.', isPublished: true },
  { subjectSlug: 'javascript', title: 'Error Handling', slug: 'js-error-handling', label: TopicLabelEnum.Foundation, order: 8, weight: 1, shortDesc: 'try/catch, custom errors', description: 'Covers synchronous and asynchronous error handling using try/catch/finally, custom error classes, and best practices for error propagation.', isPublished: true },

  // TypeScript
  { subjectSlug: 'typescript', title: 'Type System Basics', slug: 'ts-type-system', label: TopicLabelEnum.Foundation, order: 1, weight: 1, shortDesc: 'Primitives, type annotations', description: 'Introduces TypeScript\'s type system including primitive types, type annotations, type inference, and the `any`, `unknown`, and `never` types.', isPublished: true },
  { subjectSlug: 'typescript', title: 'Interfaces & Type Aliases', slug: 'ts-interfaces', label: TopicLabelEnum.Foundation, order: 2, weight: 1, shortDesc: 'Interfaces vs types', description: 'Explores interfaces and type aliases, their similarities and differences, declaration merging, and when to use each.', isPublished: true },
  { subjectSlug: 'typescript', title: 'Generics', slug: 'ts-generics', label: TopicLabelEnum.Intermediate, order: 3, weight: 2, shortDesc: 'Reusable type-safe code', description: 'Covers generic functions, interfaces, and classes, along with generic constraints and default types for writing reusable, type-safe code.', isPublished: true },
  { subjectSlug: 'typescript', title: 'Decorators', slug: 'ts-decorators', label: TopicLabelEnum.Advanced, order: 4, weight: 3, shortDesc: 'Class & method decorators', description: 'Explains decorator syntax, class decorators, method decorators, property decorators, and how frameworks like NestJS leverage them.', isPublished: true },
  { subjectSlug: 'typescript', title: 'Utility Types', slug: 'ts-utility-types', label: TopicLabelEnum.Intermediate, order: 5, weight: 2, shortDesc: 'Partial, Required, Pick, etc.', description: 'Covers built-in TypeScript utility types including Partial, Required, Readonly, Pick, Omit, Record, Exclude, and Extract.', isPublished: true },
  { subjectSlug: 'typescript', title: 'Advanced Types', slug: 'ts-advanced-types', label: TopicLabelEnum.Advanced, order: 6, weight: 3, shortDesc: 'Conditional, mapped types', description: 'Explores union and intersection types, conditional types, mapped types, template literal types, and infer keyword usage.', isPublished: true },

  // Python
  { subjectSlug: 'python', title: 'Data Types & Collections', slug: 'py-data-types', label: TopicLabelEnum.Foundation, order: 1, weight: 1, shortDesc: 'list, dict, set, tuple', description: 'Covers Python\'s built-in data types including integers, strings, lists, tuples, dictionaries, and sets, along with their operations and use cases.', isPublished: true },
  { subjectSlug: 'python', title: 'Functions & Scope', slug: 'py-functions-scope', label: TopicLabelEnum.Foundation, order: 2, weight: 1, shortDesc: 'def, *args, **kwargs, scope', description: 'Explores function definition, default arguments, *args, **kwargs, lambda expressions, and Python\'s LEGB scoping rules.', isPublished: true },
  { subjectSlug: 'python', title: 'Object-Oriented Programming', slug: 'py-oop', label: TopicLabelEnum.Intermediate, order: 3, weight: 2, shortDesc: 'Classes, inheritance, dunder', description: 'Covers classes, objects, inheritance, multiple inheritance, dunder methods, properties, and class vs instance vs static methods.', isPublished: true },
  { subjectSlug: 'python', title: 'List Comprehension', slug: 'py-list-comprehension', label: TopicLabelEnum.Foundation, order: 4, weight: 1, shortDesc: 'Concise list, dict, set ops', description: 'Introduces list comprehensions, dictionary comprehensions, set comprehensions, and generator expressions for concise and readable code.', isPublished: true },
  { subjectSlug: 'python', title: 'Error Handling', slug: 'py-error-handling', label: TopicLabelEnum.Intermediate, order: 5, weight: 2, shortDesc: 'try/except, custom exceptions', description: 'Covers exception handling with try/except/else/finally, creating custom exception classes, and best practices for raising and catching exceptions.', isPublished: true },
  { subjectSlug: 'python', title: 'Modules & Packages', slug: 'py-modules-packages', label: TopicLabelEnum.Intermediate, order: 6, weight: 2, shortDesc: 'import, packages, pip', description: 'Explains Python module system, package structure, relative and absolute imports, __init__.py, and managing dependencies with pip.', isPublished: true },
  { subjectSlug: 'python', title: 'Generators & Iterators', slug: 'py-generators', label: TopicLabelEnum.Advanced, order: 7, weight: 3, shortDesc: 'yield, lazy evaluation', description: 'Covers iterators, the iterator protocol, generators using yield, generator expressions, and practical use cases for memory-efficient data processing.', isPublished: true },

  // SQL & Databases
  { subjectSlug: 'sql-databases', title: 'SELECT Queries', slug: 'sql-select-queries', label: TopicLabelEnum.Foundation, order: 1, weight: 1, shortDesc: 'SELECT, WHERE, ORDER BY', description: 'Covers the fundamentals of SELECT statements including filtering with WHERE, sorting with ORDER BY, and limiting results with LIMIT/OFFSET.', isPublished: true },
  { subjectSlug: 'sql-databases', title: 'JOINs', slug: 'sql-joins', label: TopicLabelEnum.Foundation, order: 2, weight: 1, shortDesc: 'INNER, LEFT, RIGHT, FULL JOIN', description: 'Explains all types of SQL joins — INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, CROSS JOIN, and SELF JOIN — with practical examples.', isPublished: true },
  { subjectSlug: 'sql-databases', title: 'Indexes & Performance', slug: 'sql-indexes', label: TopicLabelEnum.Intermediate, order: 3, weight: 2, shortDesc: 'B-tree, composite indexes', description: 'Covers database indexes, how they work internally (B-tree), when to create them, composite indexes, covering indexes, and using EXPLAIN to analyze queries.', isPublished: true },
  { subjectSlug: 'sql-databases', title: 'Transactions', slug: 'sql-transactions', label: TopicLabelEnum.Intermediate, order: 4, weight: 2, shortDesc: 'ACID, COMMIT, ROLLBACK', description: 'Explores database transactions, ACID properties, isolation levels, deadlocks, and how to use BEGIN/COMMIT/ROLLBACK to ensure data integrity.', isPublished: true },
  { subjectSlug: 'sql-databases', title: 'Stored Procedures', slug: 'sql-stored-procedures', label: TopicLabelEnum.Advanced, order: 5, weight: 3, shortDesc: 'Procedures, functions, triggers', description: 'Covers stored procedures, user-defined functions, triggers, and views — when to use them, their benefits, and potential downsides.', isPublished: true },
  { subjectSlug: 'sql-databases', title: 'Database Normalization', slug: 'sql-normalization', label: TopicLabelEnum.Intermediate, order: 6, weight: 2, shortDesc: '1NF, 2NF, 3NF, BCNF', description: 'Explains normalization forms (1NF through BCNF), how to identify and eliminate redundancy, and the trade-offs between normalization and denormalization.', isPublished: true },
  { subjectSlug: 'sql-databases', title: 'Aggregation & Grouping', slug: 'sql-aggregation', label: TopicLabelEnum.Foundation, order: 7, weight: 1, shortDesc: 'GROUP BY, COUNT, SUM, HAVING', description: 'Covers aggregate functions (COUNT, SUM, AVG, MIN, MAX), GROUP BY, HAVING, and ROLLUP for summarizing and reporting on data.', isPublished: true },

  // System Design
  { subjectSlug: 'system-design', title: 'Scalability Fundamentals', slug: 'sd-scalability', label: TopicLabelEnum.Foundation, order: 1, weight: 1, shortDesc: 'Horizontal vs vertical scaling', description: 'Introduces the core concepts of scalability including horizontal vs vertical scaling, stateless design, and bottleneck identification.', isPublished: true },
  { subjectSlug: 'system-design', title: 'Load Balancing', slug: 'sd-load-balancing', label: TopicLabelEnum.Intermediate, order: 2, weight: 2, shortDesc: 'L4/L7, round-robin, health checks', description: 'Covers load balancing algorithms (round-robin, least connections, IP hash), L4 vs L7 balancers, health checks, and sticky sessions.', isPublished: true },
  { subjectSlug: 'system-design', title: 'Caching Strategies', slug: 'sd-caching', label: TopicLabelEnum.Intermediate, order: 3, weight: 2, shortDesc: 'Redis, CDN, cache patterns', description: 'Explores caching at different layers (CDN, application, database), cache eviction policies, write-through vs write-behind, and cache invalidation strategies.', isPublished: true },
  { subjectSlug: 'system-design', title: 'Database Design', slug: 'sd-database-design', label: TopicLabelEnum.Intermediate, order: 4, weight: 2, shortDesc: 'SQL vs NoSQL, sharding', description: 'Covers choosing between SQL and NoSQL, replication, sharding strategies, consistent hashing, and designing schemas for scale.', isPublished: true },
  { subjectSlug: 'system-design', title: 'Microservices Architecture', slug: 'sd-microservices', label: TopicLabelEnum.Advanced, order: 5, weight: 3, shortDesc: 'Service decomposition, APIs', description: 'Explains microservices decomposition, inter-service communication (REST, gRPC, events), service discovery, and the trade-offs vs monolithic architecture.', isPublished: true },
  { subjectSlug: 'system-design', title: 'Message Queues', slug: 'sd-message-queues', label: TopicLabelEnum.Advanced, order: 6, weight: 3, shortDesc: 'Kafka, RabbitMQ, pub/sub', description: 'Covers message queue patterns, pub/sub vs point-to-point, Kafka vs RabbitMQ, at-least-once vs exactly-once delivery, and use cases for async decoupling.', isPublished: true },
  { subjectSlug: 'system-design', title: 'API Design', slug: 'sd-api-design', label: TopicLabelEnum.Foundation, order: 7, weight: 1, shortDesc: 'REST, versioning, rate limiting', description: 'Covers RESTful API design principles, HTTP methods, status codes, versioning strategies, pagination, rate limiting, and API gateway patterns.', isPublished: true },
];

export const TOPIC_SLUGS = TOPICS.map((t) => t.slug);

export async function seedTopics(
  dataSource: DataSource,
  subjects: Subject[],
): Promise<Topic[]> {
  const repo = dataSource.getRepository(Topic);
  const subjectMap = new Map(subjects.map((s) => [s.slug, s]));

  for (const data of TOPICS) {
    const subject = subjectMap.get(data.subjectSlug);
    if (!subject) continue;

    const exists = await repo.findOne({
      where: { subjectId: subject.id, slug: data.slug },
    });
    if (!exists) {
      await repo.save(
        repo.create({
          title: data.title,
          slug: data.slug,
          subjectId: subject.id,
          label: data.label,
          order: data.order,
          weight: data.weight,
          shortDesc: data.shortDesc,
          description: data.description,
          isPublished: data.isPublished,
        }),
      );
    }
  }

  const topics = await repo.find({
    where: { slug: In(TOPIC_SLUGS) },
    order: { subjectId: 'ASC', order: 'ASC' },
  });

  console.log(`  ✔ Topics: ${topics.length} records`);
  return topics;
}
