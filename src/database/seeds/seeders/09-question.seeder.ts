import { DataSource } from 'typeorm';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { QuestionOption } from 'src/common/typeorm/entities/question-option.entity';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { QuestionTopic } from 'src/common/typeorm/entities/quesion-topic.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';

interface OptionSeed {
  option: string;
  correct: boolean;
  comment?: string;
}

interface QuestionSeed {
  subjectSlug: string;
  topicSlugs: string[];
  slug: string;
  question: string;
  answer: string;
  level: number;
  timeAllowed: number;
  options: OptionSeed[];
}

const QUESTIONS: QuestionSeed[] = [
  // ─── JavaScript ───────────────────────────────────────────────
  {
    subjectSlug: 'javascript',
    topicSlugs: ['js-variables-scope'],
    slug: 'js-hoisting',
    question: 'What is hoisting in JavaScript?',
    answer: 'Variable and function declarations are moved to the top of their scope during the compilation phase.',
    level: 1, timeAllowed: 60,
    options: [
      { option: 'Variable and function declarations are moved to the top of their scope during compilation', correct: true, comment: 'Correct. Only the declaration is hoisted, not the initialisation.' },
      { option: 'Values are automatically copied from one variable to another', correct: false },
      { option: 'JavaScript functions are deleted from memory after execution', correct: false },
      { option: 'Variables declared with var are converted to global scope', correct: false },
    ],
  },
  {
    subjectSlug: 'javascript',
    topicSlugs: ['js-variables-scope'],
    slug: 'js-typeof-null',
    question: 'What does the expression `typeof null` return in JavaScript?',
    answer: "'object' — this is a well-known JavaScript quirk that has existed since the first version.",
    level: 1, timeAllowed: 45,
    options: [
      { option: "'object'", correct: true, comment: "Correct. This is a long-standing bug in JS that was never fixed for backwards compatibility." },
      { option: "'null'", correct: false },
      { option: "'undefined'", correct: false },
      { option: "'boolean'", correct: false },
    ],
  },
  {
    subjectSlug: 'javascript',
    topicSlugs: ['js-functions-closures'],
    slug: 'js-what-is-closure',
    question: 'What is a closure in JavaScript?',
    answer: 'A closure is a function that retains access to variables from its outer (enclosing) scope even after that scope has finished executing.',
    level: 2, timeAllowed: 75,
    options: [
      { option: 'A function that retains access to variables from its outer scope after that scope has finished executing', correct: true, comment: 'Correct. Closures are fundamental to patterns like module design and data encapsulation.' },
      { option: 'A method used to close and remove event listeners from the DOM', correct: false },
      { option: 'A way to terminate the execution of an asynchronous function early', correct: false },
      { option: 'A special type of loop that runs a fixed number of times', correct: false },
    ],
  },
  {
    subjectSlug: 'javascript',
    topicSlugs: ['js-es6-features'],
    slug: 'js-spread-operator',
    question: 'What does the spread operator (`...`) do when used with an array?',
    answer: 'It expands the array into individual elements, which is useful for copying arrays, merging arrays, or passing elements as function arguments.',
    level: 1, timeAllowed: 60,
    options: [
      { option: 'Expands an array into its individual elements', correct: true, comment: 'Correct. For example, Math.max(...[1,2,3]) passes 1, 2, 3 as separate arguments.' },
      { option: 'Merges two arrays and removes duplicate values', correct: false },
      { option: 'Creates a deep copy of a nested object', correct: false },
      { option: 'Pauses function execution until a Promise resolves', correct: false },
    ],
  },
  {
    subjectSlug: 'javascript',
    topicSlugs: ['js-promises-async'],
    slug: 'js-promise-vs-async',
    question: 'What is the main advantage of using `async/await` over raw `.then()` chains?',
    answer: 'async/await makes asynchronous code read like synchronous code, improving readability and simplifying error handling with try/catch.',
    level: 2, timeAllowed: 75,
    options: [
      { option: 'It makes async code read synchronously, simplifying error handling with try/catch', correct: true, comment: 'Correct. async/await is syntactic sugar over Promises and produces the same result.' },
      { option: 'It runs asynchronous operations in parallel automatically', correct: false },
      { option: 'It eliminates the need for Promises entirely', correct: false },
      { option: 'It makes code execute faster by skipping the event loop', correct: false },
    ],
  },

  // ─── TypeScript ───────────────────────────────────────────────
  {
    subjectSlug: 'typescript',
    topicSlugs: ['ts-interfaces'],
    slug: 'ts-interface-vs-type',
    question: 'What is the key difference between an `interface` and a `type` alias in TypeScript?',
    answer: 'Interfaces support declaration merging and are open for extension; type aliases support union and intersection types and cannot be re-opened.',
    level: 2, timeAllowed: 75,
    options: [
      { option: 'Interfaces can be extended and merged; type aliases support union and intersection types', correct: true, comment: 'Correct. In practice, prefer interfaces for object shapes and types for unions/intersections.' },
      { option: 'Type aliases can be extended via the extends keyword but interfaces cannot', correct: false },
      { option: 'Interfaces can only be used with classes, not plain objects', correct: false },
      { option: 'There is no practical difference; they are interchangeable in all scenarios', correct: false },
    ],
  },
  {
    subjectSlug: 'typescript',
    topicSlugs: ['ts-type-system'],
    slug: 'ts-readonly-modifier',
    question: 'What does the `readonly` modifier do when applied to a class property in TypeScript?',
    answer: 'It prevents the property from being reassigned after the object is initialised (either at declaration or in the constructor).',
    level: 1, timeAllowed: 60,
    options: [
      { option: 'Prevents the property from being reassigned after initialisation', correct: true, comment: 'Correct. readonly enforces immutability at the type level, caught at compile time.' },
      { option: 'Makes the property invisible to code outside the class', correct: false },
      { option: 'Converts the property into a static class member', correct: false },
      { option: 'Ensures the property is only accessible in derived classes', correct: false },
    ],
  },
  {
    subjectSlug: 'typescript',
    topicSlugs: ['ts-generics'],
    slug: 'ts-generic-types',
    question: 'What is the purpose of a generic type parameter in TypeScript?',
    answer: 'Generic type parameters act as placeholders that allow writing reusable, type-safe functions, classes, and interfaces without sacrificing type information.',
    level: 2, timeAllowed: 75,
    options: [
      { option: 'A placeholder that enables reusable, type-safe code without losing type information', correct: true, comment: 'Correct. Example: function identity<T>(arg: T): T returns the exact type passed in.' },
      { option: 'A type that accepts any value without performing type checking', correct: false },
      { option: 'A built-in type for handling database records and responses', correct: false },
      { option: 'A type alias reserved for JavaScript primitive types', correct: false },
    ],
  },
  {
    subjectSlug: 'typescript',
    topicSlugs: ['ts-utility-types'],
    slug: 'ts-partial-utility',
    question: 'Which TypeScript utility type makes all properties of a type optional?',
    answer: 'Partial<T> constructs a type with all properties of T set to optional.',
    level: 1, timeAllowed: 45,
    options: [
      { option: 'Partial<T>', correct: true, comment: 'Correct. Useful when you want to accept objects with only a subset of properties, e.g. in update DTOs.' },
      { option: 'Required<T>', correct: false, comment: 'Required<T> does the opposite — it makes all properties required.' },
      { option: 'Readonly<T>', correct: false },
      { option: 'Omit<T, K>', correct: false },
    ],
  },
  {
    subjectSlug: 'typescript',
    topicSlugs: ['ts-advanced-types'],
    slug: 'ts-non-null-assertion',
    question: 'What does the non-null assertion operator (`!`) tell the TypeScript compiler?',
    answer: "It tells the compiler that the value is guaranteed to be non-null and non-undefined at runtime, suppressing the null-check error.",
    level: 2, timeAllowed: 60,
    options: [
      { option: 'That the value is guaranteed to be non-null and non-undefined at this point', correct: true, comment: 'Correct. Use sparingly — if the assertion is wrong, you will get a runtime error.' },
      { option: 'That the value should be negated (equivalent to the ! logical operator)', correct: false },
      { option: 'That the value should be forcefully cast to a different type', correct: false },
      { option: 'That the property is optional and may be skipped during assignment', correct: false },
    ],
  },

  // ─── Python ───────────────────────────────────────────────────
  {
    subjectSlug: 'python',
    topicSlugs: ['py-functions-scope'],
    slug: 'py-decorators',
    question: 'What is a Python decorator?',
    answer: 'A decorator is a function that takes another function as input and returns a modified version of it, allowing behavior to be added without changing the original source code.',
    level: 2, timeAllowed: 75,
    options: [
      { option: 'A function that wraps and modifies the behavior of another function', correct: true, comment: 'Correct. Decorators use the @syntax and are commonly used for logging, auth, and caching.' },
      { option: 'A special comment syntax for documenting functions', correct: false },
      { option: 'A type annotation system for function return values', correct: false },
      { option: 'A way to import and alias external modules', correct: false },
    ],
  },
  {
    subjectSlug: 'python',
    topicSlugs: ['py-list-comprehension'],
    slug: 'py-list-comp-output',
    question: 'What is the output of `[x ** 2 for x in range(3)]` in Python?',
    answer: '[0, 1, 4] — range(3) produces 0, 1, 2 and squaring each gives 0, 1, 4.',
    level: 1, timeAllowed: 45,
    options: [
      { option: '[0, 1, 4]', correct: true, comment: 'Correct. range(3) yields 0, 1, 2. Squaring: 0²=0, 1²=1, 2²=4.' },
      { option: '[1, 4, 9]', correct: false, comment: 'This would be the result of [x**2 for x in range(1, 4)].' },
      { option: '[0, 1, 2]', correct: false },
      { option: '[0, 2, 4]', correct: false },
    ],
  },
  {
    subjectSlug: 'python',
    topicSlugs: ['py-functions-scope'],
    slug: 'py-args-keyword',
    question: 'What does `*args` do in a Python function definition?',
    answer: '*args allows a function to accept any number of positional arguments, which are collected into a tuple inside the function.',
    level: 1, timeAllowed: 60,
    options: [
      { option: 'Accepts any number of positional arguments, collected into a tuple', correct: true, comment: 'Correct. Use **kwargs to accept arbitrary keyword arguments as a dict.' },
      { option: 'Accepts any number of keyword arguments as a dictionary', correct: false },
      { option: 'Marks a function as a generator using the yield keyword', correct: false },
      { option: 'Unpacks a list when calling the function', correct: false },
    ],
  },
  {
    subjectSlug: 'python',
    topicSlugs: ['py-data-types'],
    slug: 'py-is-vs-equals',
    question: 'What is the difference between `is` and `==` in Python?',
    answer: '`is` checks object identity (whether two variables point to the same object in memory), while `==` checks value equality.',
    level: 2, timeAllowed: 60,
    options: [
      { option: '`is` checks object identity (same memory address); `==` checks value equality', correct: true, comment: 'Correct. For example, [1,2] == [1,2] is True but [1,2] is [1,2] is False.' },
      { option: '`is` checks type equality; `==` checks value equality', correct: false },
      { option: '`is` is only used for numeric comparisons; `==` works for all types', correct: false },
      { option: 'There is no practical difference between them in modern Python', correct: false },
    ],
  },
  {
    subjectSlug: 'python',
    topicSlugs: ['py-oop'],
    slug: 'py-dunder-init',
    question: 'What is the purpose of the `__init__` method in a Python class?',
    answer: '__init__ is the constructor method called automatically when a new instance of a class is created, used to initialise instance attributes.',
    level: 1, timeAllowed: 60,
    options: [
      { option: 'It initialises instance attributes when a new object is created', correct: true, comment: 'Correct. __init__ receives self (the new instance) plus any constructor arguments.' },
      { option: 'It is called when the object is garbage collected', correct: false, comment: 'That is __del__, the destructor.' },
      { option: 'It defines class-level (static) attributes shared across all instances', correct: false },
      { option: 'It is only required when the class inherits from another class', correct: false },
    ],
  },

  // ─── SQL & Databases ──────────────────────────────────────────
  {
    subjectSlug: 'sql-databases',
    topicSlugs: ['sql-joins'],
    slug: 'sql-inner-vs-left-join',
    question: 'What is the difference between INNER JOIN and LEFT JOIN in SQL?',
    answer: 'INNER JOIN returns only rows where there is a match in both tables. LEFT JOIN returns all rows from the left table plus matching rows from the right table (NULLs for non-matches).',
    level: 1, timeAllowed: 75,
    options: [
      { option: 'INNER JOIN returns only matching rows; LEFT JOIN returns all left rows plus matches', correct: true, comment: 'Correct. Use LEFT JOIN when you need all records from the primary table regardless of matches.' },
      { option: 'LEFT JOIN is always faster than INNER JOIN due to fewer comparisons', correct: false },
      { option: 'INNER JOIN can only be used on indexed columns', correct: false },
      { option: 'They produce identical result sets in all scenarios', correct: false },
    ],
  },
  {
    subjectSlug: 'sql-databases',
    topicSlugs: ['sql-aggregation'],
    slug: 'sql-having-clause',
    question: 'Which SQL clause is used to filter results AFTER aggregation?',
    answer: 'HAVING is used to filter groups after GROUP BY aggregation, whereas WHERE filters individual rows before aggregation.',
    level: 1, timeAllowed: 45,
    options: [
      { option: 'HAVING', correct: true, comment: 'Correct. Example: SELECT dept, COUNT(*) FROM employees GROUP BY dept HAVING COUNT(*) > 5' },
      { option: 'WHERE', correct: false, comment: 'WHERE filters rows before grouping; it cannot reference aggregate functions.' },
      { option: 'GROUP BY', correct: false },
      { option: 'FILTER', correct: false },
    ],
  },
  {
    subjectSlug: 'sql-databases',
    topicSlugs: ['sql-indexes'],
    slug: 'sql-database-index',
    question: 'What is the primary purpose of a database index?',
    answer: 'Indexes speed up data retrieval by creating a separate data structure (typically a B-tree) that lets the database locate rows without scanning the entire table.',
    level: 2, timeAllowed: 60,
    options: [
      { option: 'Speed up data retrieval by avoiding full table scans', correct: true, comment: 'Correct. The trade-off is slightly slower writes and additional storage overhead.' },
      { option: 'Enforce referential integrity between related tables', correct: false, comment: 'That is the role of foreign key constraints.' },
      { option: 'Prevent duplicate values from being inserted into a column', correct: false, comment: 'A UNIQUE constraint does this, though a unique index is used to enforce it.' },
      { option: 'Automatically compute and store derived column values', correct: false },
    ],
  },
  {
    subjectSlug: 'sql-databases',
    topicSlugs: ['sql-select-queries'],
    slug: 'sql-distinct-keyword',
    question: 'What does the DISTINCT keyword do in a SELECT statement?',
    answer: 'DISTINCT eliminates duplicate rows from the result set, returning only unique combinations of the selected columns.',
    level: 1, timeAllowed: 45,
    options: [
      { option: 'Returns only unique (non-duplicate) rows from the result set', correct: true, comment: 'Correct. SELECT DISTINCT applies to the entire row, not just one column.' },
      { option: 'Sorts the result set in descending alphabetical order', correct: false },
      { option: 'Excludes NULL values from the result set automatically', correct: false },
      { option: 'Groups rows by the specified column', correct: false },
    ],
  },
  {
    subjectSlug: 'sql-databases',
    topicSlugs: ['sql-normalization'],
    slug: 'sql-foreign-key',
    question: 'What is a foreign key in a relational database?',
    answer: 'A foreign key is a column (or set of columns) in one table that references the primary key of another table, establishing a link between the two tables and enforcing referential integrity.',
    level: 1, timeAllowed: 60,
    options: [
      { option: 'A column that references the primary key of another table to enforce referential integrity', correct: true, comment: 'Correct. The database will reject inserts/updates that violate the foreign key constraint.' },
      { option: 'An alternative unique identifier for a table when a natural key exists', correct: false },
      { option: 'An encrypted key used to protect sensitive column values', correct: false },
      { option: 'A composite key made of multiple columns that together form the primary key', correct: false },
    ],
  },

  // ─── System Design ────────────────────────────────────────────
  {
    subjectSlug: 'system-design',
    topicSlugs: ['sd-scalability'],
    slug: 'sd-horizontal-scaling',
    question: 'What is horizontal scaling (scaling out) in system design?',
    answer: 'Horizontal scaling means adding more machines to a system to distribute the load, as opposed to vertical scaling which adds more resources to a single machine.',
    level: 1, timeAllowed: 60,
    options: [
      { option: 'Adding more machines to distribute load across the system', correct: true, comment: 'Correct. Horizontal scaling is preferred for high availability and fault tolerance.' },
      { option: 'Adding more CPU or RAM to an existing single machine', correct: false, comment: 'That is vertical scaling (scaling up).' },
      { option: 'Reducing the number of servers to cut infrastructure costs', correct: false },
      { option: 'Distributing a single database across multiple geographic regions', correct: false },
    ],
  },
  {
    subjectSlug: 'system-design',
    topicSlugs: ['sd-load-balancing'],
    slug: 'sd-load-balancer-purpose',
    question: 'What is the primary purpose of a load balancer in a distributed system?',
    answer: 'A load balancer distributes incoming network traffic across multiple servers to ensure no single server becomes a bottleneck, improving availability and reliability.',
    level: 1, timeAllowed: 60,
    options: [
      { option: 'Distribute incoming traffic evenly across multiple backend servers', correct: true, comment: 'Correct. Load balancers also perform health checks and remove unhealthy nodes from rotation.' },
      { option: 'Cache frequently accessed data to reduce database load', correct: false },
      { option: 'Encrypt all traffic between the client and server', correct: false },
      { option: 'Monitor server performance and alert on anomalies', correct: false },
    ],
  },
  {
    subjectSlug: 'system-design',
    topicSlugs: ['sd-caching'],
    slug: 'sd-cdn-purpose',
    question: 'What is the primary use case for a Content Delivery Network (CDN)?',
    answer: 'A CDN serves static assets (images, JS, CSS) from edge servers geographically close to users, reducing latency and load on origin servers.',
    level: 1, timeAllowed: 60,
    options: [
      { option: 'Serve static content from servers geographically close to the user', correct: true, comment: 'Correct. CDNs dramatically reduce latency for static assets by caching them at the edge.' },
      { option: 'Store and manage encrypted user authentication tokens', correct: false },
      { option: 'Synchronise database replicas across multiple regions', correct: false },
      { option: 'Monitor and alert on API response time degradation', correct: false },
    ],
  },
  {
    subjectSlug: 'system-design',
    topicSlugs: ['sd-database-design'],
    slug: 'sd-eventual-consistency',
    question: 'What does eventual consistency mean in distributed systems?',
    answer: 'Eventual consistency is a consistency model where, given enough time and no new updates, all replicas will converge to the same value — but not necessarily at the same instant.',
    level: 3, timeAllowed: 90,
    options: [
      { option: 'All nodes will converge to the same state given enough time with no new updates', correct: true, comment: 'Correct. Systems like Amazon DynamoDB use eventual consistency for high availability.' },
      { option: 'All nodes are guaranteed to be consistent at every single moment', correct: false, comment: 'That describes strong consistency.' },
      { option: 'Data is synchronised across all nodes within milliseconds of every write', correct: false },
      { option: 'Consistency is permanently sacrificed in favour of performance', correct: false },
    ],
  },
  {
    subjectSlug: 'system-design',
    topicSlugs: ['sd-scalability', 'sd-microservices'],
    slug: 'sd-cap-theorem',
    question: 'What does the CAP theorem state about distributed systems?',
    answer: 'CAP theorem states that a distributed data store can only guarantee two of three properties simultaneously: Consistency, Availability, and Partition tolerance.',
    level: 3, timeAllowed: 90,
    options: [
      { option: 'A distributed system can simultaneously guarantee only two of: Consistency, Availability, Partition tolerance', correct: true, comment: 'Correct. Since network partitions are unavoidable, you must choose between C and A in practice (CP vs AP).' },
      { option: 'Every distributed database must provide Consistency, Availability, and Performance', correct: false },
      { option: 'Distributed systems must always sacrifice consistency to remain highly available', correct: false },
      { option: 'Network partitions never occur in well-designed distributed systems', correct: false },
    ],
  },
];

export async function seedQuestions(
  dataSource: DataSource,
  subjects: Subject[],
  topics: Topic[],
): Promise<void> {
  const questionRepo = dataSource.getRepository(Question);
  const optionRepo = dataSource.getRepository(QuestionOption);
  const questionTopicRepo = dataSource.getRepository(QuestionTopic);

  const subjectMap = new Map(subjects.map((s) => [s.slug, s]));
  const topicMap = new Map(topics.map((t) => [t.slug, t]));

  let questionCount = 0;
  let optionCount = 0;
  let topicLinkCount = 0;

  for (const data of QUESTIONS) {
    const subject = subjectMap.get(data.subjectSlug);
    if (!subject) continue;

    let question = await questionRepo.findOne({ where: { slug: data.slug } });

    if (!question) {
      question = await questionRepo.save(
        questionRepo.create({
          slug: data.slug,
          question: data.question,
          answer: data.answer,
          subjectId: subject.id,
          questionType: QuestionTypeEnum.Trivia,
          level: data.level,
          marks: data.level,
          timeAllowed: data.timeAllowed,
          status: QuestionStatusEnum.Active,
          isWhitelisted: false,
        }),
      );
      questionCount++;

      for (const opt of data.options) {
        await optionRepo.save(
          optionRepo.create({
            questionId: question.id,
            option: opt.option,
            correct: opt.correct,
            comment: opt.comment ?? null,
          }),
        );
        optionCount++;
      }
    }

    for (const topicSlug of data.topicSlugs) {
      const topic = topicMap.get(topicSlug);
      if (!topic) continue;

      const linkExists = await questionTopicRepo.findOne({
        where: { questionId: question.id, topicId: topic.id },
      });
      if (!linkExists) {
        await questionTopicRepo.save(
          questionTopicRepo.create({ questionId: question.id, topicId: topic.id }),
        );
        topicLinkCount++;
      }
    }
  }

  console.log(`  ✔ Questions: ${questionCount} new | Options: ${optionCount} new | Topic links: ${topicLinkCount} new`);
}
