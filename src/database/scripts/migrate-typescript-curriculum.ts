/**
 * migrate-typescript-curriculum.ts
 *
 * One-time migration for the TypeScript subject (id=4).
 *
 * What it does:
 *   1. Renames 8 of 10 topic titles and their slugs
 *   2. Sets correct order (1-10), weight (1/2/3), and label on all 10 topics
 *   3. Populates shortDesc, description, and goal on all 10 topics
 *   4. Renames "TS Essentials" track and updates its description
 *   5. Renames "TS Deep Dive" → "Advanced Type System" track
 *   6. Creates the new "TypeScript at Scale" track
 *   7. Clears all existing subject_track_topic links for TypeScript tracks
 *   8. Creates the correct track → topic links
 *
 * Run once:
 *   npx ts-node -r tsconfig-paths/register src/database/scripts/migrate-typescript-curriculum.ts
 *
 * After running, keep typescript-curriculum.json as the canonical seed reference.
 */

import 'dotenv/config';
import { AppDataSource } from '../data-source';

const SUBJECT_ID = 4; // TypeScript

// ── Topic updates (by existing id) ───────────────────────────────────────────

const TOPIC_UPDATES = [
  {
    id: 63,
    title: 'Introduction to TypeScript',
    slug: 'introduction-to-typescript',
    label: 'Foundation',
    order: 1,
    weight: 1,
    shortDesc: 'What is TypeScript, tsc, type annotations',
    description:
      'Covers what TypeScript is and why it exists over plain JavaScript, installing TypeScript and the tsc compiler, running TypeScript with ts-node, the TypeScript Playground for quick experimentation, adding basic type annotations to variables and function parameters, the compilation step to JavaScript, and how TypeScript integrates with existing JavaScript codebases.',
    goal:
      'Explain what TypeScript adds over JavaScript, compile and run TypeScript files using tsc and ts-node, and add basic type annotations to variables and function signatures.',
  },
  {
    id: 64,
    title: 'TypeScript Configuration',
    slug: 'typescript-configuration',
    label: 'Foundation',
    order: 2,
    weight: 1,
    shortDesc: 'tsconfig.json, strict mode, path aliases',
    description:
      'Covers the tsconfig.json file and its key compilerOptions: target (ES version output), module (CommonJS, ESNext), lib, outDir, rootDir, and baseUrl. Deep-dives into strict mode and its constituent flags (strictNullChecks, noImplicitAny, strictFunctionTypes, strictPropertyInitialization). Also covers include/exclude path patterns, path aliases for clean imports, project references for monorepos, and the role of build tools like esbuild and swc alongside tsc.',
    goal:
      'Configure a TypeScript project with tsconfig.json, enable and understand each strict mode flag, and set up path aliases to eliminate relative import chains.',
  },
  {
    id: 65,
    title: 'Core Types',
    slug: 'core-types',
    label: 'Foundation',
    order: 3,
    weight: 1,
    shortDesc: 'Primitives, arrays, tuples, enums, unknown',
    description:
      'Covers TypeScript\'s built-in primitive types (string, number, boolean, bigint, symbol), typed arrays and readonly arrays, tuples for fixed-length typed structures, numeric and string enums and const enums, the special types any, unknown, never, void, null, and undefined, union types (|) and type aliases with the type keyword, and the difference between type widening and type narrowing.',
    goal:
      'Annotate variables and function parameters with TypeScript\'s core types, choose between any and unknown correctly, define type aliases and basic union types, and explain the difference between null, undefined, void, and never.',
  },
  {
    id: 72,
    title: 'Interfaces & Type Aliases',
    slug: 'interfaces-type-aliases',
    label: 'Foundation',
    order: 4,
    weight: 1,
    shortDesc: 'interface vs type, extends, structural typing',
    description:
      'Covers defining object contracts with interface, optional (?) and readonly properties, extending interfaces with extends and merging via declaration merging, intersection types (&) for type composition, the key differences between interface and type alias (primitives, declaration merging, extending), structural (duck) typing and what it means for assignability, index signatures for dynamic keys, and practical guidance on when to prefer interface versus type.',
    goal:
      'Define object shapes using both interface and type alias, understand structural typing and assignability, compose types with extends and intersections, and choose the correct tool for each use case.',
  },
  {
    id: 66,
    title: 'Functions & Classes',
    slug: 'functions-classes',
    label: 'Foundation',
    order: 5,
    weight: 1,
    shortDesc: 'Typed functions, overloads, OOP in TypeScript',
    description:
      'Covers typing function parameters and return values, optional and default parameters, rest parameters with typed arrays, function overloads for multiple call signatures, the this parameter type annotation, TypeScript classes with explicit property declarations, access modifiers (public, private, protected) and readonly, the private class field syntax (#), abstract classes and abstract methods, implements for interface adherence, and static members and class expressions.',
    goal:
      'Write fully typed functions including overloads, implement TypeScript classes with access modifiers and abstract patterns, and enforce interface contracts on classes with implements.',
  },
  {
    id: 69,
    title: 'Generics',
    slug: 'generics',
    label: 'Intermediate',
    order: 6,
    weight: 2,
    shortDesc: 'Generic functions, constraints, type inference',
    description:
      'Covers the motivation for generics — writing reusable typed code without losing type information — generic function syntax with <T>, generic interfaces and generic classes, applying constraints with extends to limit accepted types, multiple type parameters and their interaction, default type parameters (TypeScript 4.7+), const type parameters (TypeScript 5.0+) for preserving literal types during inference, and common real-world generic patterns (wrapper types, factory functions, repository patterns).',
    goal:
      'Write generic functions and classes that are both reusable and type-safe, apply constraints with extends, use default type parameters, and understand how TypeScript infers type arguments automatically.',
  },
  {
    id: 67,
    title: 'Advanced Type System',
    slug: 'advanced-type-system',
    label: 'Intermediate',
    order: 7,
    weight: 2,
    shortDesc: 'Discriminated unions, conditional, mapped types',
    description:
      'Covers literal types and literal narrowing, discriminated union patterns (tagged unions) for exhaustive type-safe branching, type guards using typeof, instanceof, the in operator, and user-defined type predicates (is), conditional types (T extends U ? X : Y), the infer keyword inside conditional types, mapped types (transforming all properties of a type), template literal types (TypeScript 4.1+) for string-based type generation, and the satisfies operator (TypeScript 4.9+) for validating without widening.',
    goal:
      'Model complex domain data with discriminated unions, write type guard functions, create conditional and mapped types for type transformations, and use template literal types to generate string-based type variants.',
  },
  {
    id: 70,
    title: 'Utility Types',
    slug: 'utility-types',
    label: 'Intermediate',
    order: 8,
    weight: 2,
    shortDesc: 'Partial, Pick, Omit, Record, ReturnType',
    description:
      'Covers TypeScript\'s complete set of built-in utility types: Partial<T>, Required<T>, Readonly<T>, Pick<T,K>, Omit<T,K>, Record<K,V>, Extract<T,U>, Exclude<T,U>, NonNullable<T>, ReturnType<F>, Parameters<F>, ConstructorParameters<T>, InstanceType<T>, and Awaited<T>. Covers how to chain and combine utility types for real-world DTO and API typing, and how to implement custom utility types from scratch using mapped types, conditional types, and the keyof and typeof operators.',
    goal:
      'Apply the standard TypeScript utility types to derive and transform types for DTOs, API responses, and component props, and build custom utility types using mapped and conditional types.',
  },
  {
    id: 68,
    title: 'Modules & Declaration Files',
    slug: 'modules-declaration-files',
    label: 'Advanced',
    order: 9,
    weight: 3,
    shortDesc: '.d.ts files, @types packages, module augmentation',
    description:
      'Covers ES Module syntax in TypeScript (import/export), module resolution strategies (node16, bundler), the purpose and structure of .d.ts declaration files, installing community type definitions via @types packages, writing your own ambient .d.ts files for untyped JavaScript libraries, module augmentation and declaration merging for extending existing library types, the declare keyword for ambient declarations, triple-slash reference directives, and why namespaces are considered legacy in modern TypeScript.',
    goal:
      'Manage imports and exports in a TypeScript project, install and interpret @types packages, write declaration files for untyped libraries, and use module augmentation to extend existing type definitions.',
  },
  {
    id: 71,
    title: 'Decorators & Framework Integration',
    slug: 'decorators-framework-integration',
    label: 'Advanced',
    order: 10,
    weight: 3,
    shortDesc: 'Stage 3 decorators, metadata, Angular/NestJS',
    description:
      'Covers TypeScript decorators using the stable Stage 3 syntax (no experimental flags required since TypeScript 5.0), class decorators, method decorators, property and accessor decorators, parameter decorators, decorator factories, and the TC39 Decorator Metadata proposal (stable since TypeScript 5.2). Shows how Angular uses @Component, @Injectable, @Pipe, and @Directive, how NestJS uses @Controller, @Get, @Injectable, and validation decorators, and how to type React component props, hooks, context, and event handlers correctly in TypeScript.',
    goal:
      'Write and compose class and method decorators using Stage 3 syntax, explain how Angular and NestJS decorators work under the hood via metadata, and correctly type Angular services, components, and React component props with TypeScript.',
  },
];

// ── Track updates ─────────────────────────────────────────────────────────────

const TRACK_UPDATES = [
  {
    id: 3,
    title: 'TypeScript Essentials',
    slug: 'typescript-essentials',
    description:
      'Build a solid TypeScript foundation — understand why TypeScript exists, configure your project with tsconfig.json, master core and structured types, define interfaces and type aliases, and write fully typed functions and classes.',
    sortOrder: 1,
    topicIds: [63, 64, 65, 72, 66], // Introduction, Config, Core Types, Interfaces, Functions & Classes
  },
  {
    id: 4,
    title: 'Advanced Type System',
    slug: 'advanced-type-system',
    description:
      'Go deep into TypeScript\'s type system — write reusable generic code, model complex data with discriminated unions and conditional types, and leverage the full set of built-in utility types to derive and transform types without repetition.',
    sortOrder: 2,
    topicIds: [69, 67, 70], // Generics, Advanced Type System, Utility Types
  },
];

const NEW_TRACK = {
  title: 'TypeScript at Scale',
  slug: 'typescript-at-scale',
  description:
    'Apply TypeScript in professional codebases — manage modules and declaration files for third-party libraries, write Stage 3 decorators, and integrate TypeScript correctly with Angular and NestJS for enterprise-grade applications.',
  sortOrder: 3,
  topicIds: [68, 71], // Modules & Declaration Files, Decorators & Framework Integration
};

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await AppDataSource.initialize();
  console.log('Connected.\n');

  // 1. Update all 10 topics
  console.log('Updating topics...');
  for (const t of TOPIC_UPDATES) {
    await AppDataSource.query(
      `UPDATE topic SET title=?, slug=?, label=?, \`order\`=?, weight=?, shortDesc=?, description=?, goal=?
       WHERE id=? AND subjectId=?`,
      [t.title, t.slug, t.label, t.order, t.weight, t.shortDesc, t.description, t.goal, t.id, SUBJECT_ID],
    );
    console.log(`  ✔ [${t.order}] ${t.title}`);
  }

  // 2. Update existing tracks
  console.log('\nUpdating existing tracks...');
  for (const tr of TRACK_UPDATES) {
    await AppDataSource.query(
      `UPDATE subject_track SET title=?, slug=?, description=?, sortOrder=? WHERE id=?`,
      [tr.title, tr.slug, tr.description, tr.sortOrder, tr.id],
    );
    console.log(`  ✔ Track "${tr.title}" updated`);
  }

  // 3. Create new track (idempotent — skip if already exists)
  console.log('\nCreating new track...');
  const existingNewTrack = await AppDataSource.query(
    `SELECT id FROM subject_track WHERE slug=? AND subjectId=?`,
    [NEW_TRACK.slug, SUBJECT_ID],
  );
  let newTrackId: number;
  if (existingNewTrack.length > 0) {
    newTrackId = existingNewTrack[0].id;
    await AppDataSource.query(
      `UPDATE subject_track SET title=?, description=?, sortOrder=? WHERE id=?`,
      [NEW_TRACK.title, NEW_TRACK.description, NEW_TRACK.sortOrder, newTrackId],
    );
    console.log(`  ✔ Track "${NEW_TRACK.title}" already exists (id=${newTrackId}) — updated`);
  } else {
    const result = await AppDataSource.query(
      `INSERT INTO subject_track (title, slug, subjectId, description, sortOrder, isPublished)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [NEW_TRACK.title, NEW_TRACK.slug, SUBJECT_ID, NEW_TRACK.description, NEW_TRACK.sortOrder],
    );
    newTrackId = result.insertId;
    console.log(`  ✔ Track "${NEW_TRACK.title}" created (id=${newTrackId})`);
  }

  // 4. Clear all existing track-topic links for TypeScript tracks (ids 3, 4, and new)
  console.log('\nClearing existing track-topic links...');
  const allTrackIds = [TRACK_UPDATES[0].id, TRACK_UPDATES[1].id, newTrackId];
  await AppDataSource.query(
    `DELETE FROM subject_track_topic WHERE subjectTrackId IN (${allTrackIds.map(() => '?').join(',')})`,
    allTrackIds,
  );
  console.log('  ✔ Old links cleared');

  // 5. Insert new track-topic links
  console.log('\nCreating track-topic links...');
  const allLinks: { trackId: number; topicIds: number[] }[] = [
    { trackId: TRACK_UPDATES[0].id, topicIds: TRACK_UPDATES[0].topicIds },
    { trackId: TRACK_UPDATES[1].id, topicIds: TRACK_UPDATES[1].topicIds },
    { trackId: newTrackId,          topicIds: NEW_TRACK.topicIds },
  ];

  for (const { trackId, topicIds } of allLinks) {
    for (const topicId of topicIds) {
      await AppDataSource.query(
        `INSERT INTO subject_track_topic (subjectTrackId, topicId) VALUES (?, ?)`,
        [trackId, topicId],
      );
    }
    console.log(`  ✔ Track id=${trackId}: ${topicIds.length} topics linked`);
  }

  await AppDataSource.destroy();
  console.log('\nMigration complete.');
  console.log('Next: commit typescript-curriculum.json as the canonical seed reference.');
}

main().catch(e => { console.error('\nFailed:', e.message); process.exit(1); });
