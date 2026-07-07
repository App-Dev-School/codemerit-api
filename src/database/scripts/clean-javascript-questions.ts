/**
 * Cleans up questions-javascript.json and removes bad questions from the DB.
 *
 * What it does:
 *   1. Applies systematic fixes to every question in the JSON:
 *      - timeAllowed: level 1 → 60, level 2 → 75, level 3 → 90
 *      - strips leading/trailing whitespace from question and option text
 *      - removes trailing \n from question text
 *   2. Removes questions with known issues (test question, empty options, wrong
 *      correct answers, near-duplicates)
 *   3. Reassigns misassigned questions to their correct topics
 *   4. Applies targeted per-question content fixes
 *   5. Writes the cleaned JSON back to disk
 *   6. Connects to the DB and DELETEs the removed questions by slug
 *
 * After this script:
 *   npm run import:questions -- src/database/seeds/questions-javascript.json --update
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../data-source';

const JSON_PATH = path.join(
  process.cwd(),
  'src/database/seeds/questions-javascript.json',
);

// ── Questions to remove entirely ────────────────────────────────────────────

const SLUGS_TO_REMOVE = new Set([
  // Test/placeholder question
  'which-of-the-following-is-the-correct-sy-meyb9s6c',

  // No options — cannot be asked
  'what-is-one-advantage-of-using-vs-code-o',
  'why-is-npm-useful-in-javascript-projects',

  // Wrong correct answer: says "while runs at least once" (backwards)
  'what-is-the-main-difference-between-whil',

  // First option literally repeats the question text
  'what-happens-if-a-function-does-not-have',

  // Near-duplicate of which-scope-do-variables-declared-inside (same answer)
  'which-scope-type-applies-to-variables-de',

  // ── Duplicates in JavaScript Arrays and Objects ──────────────────────────
  // Keep originals (no suffix); remove these mf-suffixed copies:
  '1-what-is-the-main-purpose-of-an-array',
  'what-is-the-index-of-the-first-element-i-mf3sfbo4',
  'which-property-gives-the-number-of-eleme-mf3shkp6',
  'which-of-the-following-can-arrays-store-mf3spn1w',
  'what-is-the-main-difference-between-arra',
  'what-happens-when-you-access-an-array-el-mf3t0qff',
  'can-objects-in-javascript-contain-functi-mf3tdlfb',
  'which-loop-is-most-commonly-used-to-ite',
  'if-you-add-a-property-with-a-string-key-mf3vg8fw',
  'what-happens-if-an-object-has-two-prope-mf3vj3fg',
  'what-is-true-about-const-objects-and-arr-mf3vmggp',
  'when-is-an-array-a-better-choice-than-an-mf3wcytq',
  'what-does-the-delete-operator-do-when-us-mf3wfzj7',
  'why-are-objects-better-than-arrays-for-s',
  'internally-how-are-javascript-arrays-re',
  'what-happens-if-you-assign-a-value-at-a-mf3wpr27',
  'why-is-it-preferable-to-use-push-instead-mf3wt58g',
  'what-do-we-call-an-array-or-object-store-mf3ww6d7',
  'how-are-arrays-and-objects-often-combine',
  'why-might-you-still-use-objects-instead-mf3x2vmm',
]);

// ── Topic reassignments ──────────────────────────────────────────────────────

const TOPIC_REASSIGNMENTS: Record<string, string> = {
  // Control flow questions wrongly placed in "Setting Up Development Environment"
  'which-keyword-is-used-to-test-multiple-c': 'Control Flow & Logic Building',
  'what-is-the-default-value-of-a-missing-c': 'Control Flow & Logic Building',
  'which-loop-will-execute-at-least-once-re': 'Control Flow & Logic Building',
  'which-statement-immediately-exits-a-loop': 'Control Flow & Logic Building',
  'what-does-continue-do-inside-a-loop':      'Control Flow & Logic Building',
  'in-nested-if-else-how-does-javascript-d': 'Control Flow & Logic Building',

  // Array-related questions that drifted into "JavaScript Syntax and Basics"
  '18-which-of-the-following-is-the-correc': 'JavaScript Arrays and Objects',
  'which-of-the-following-methods-can-be-us': 'JavaScript Arrays and Objects',
  'what-happens-when-you-access-an-array-el': 'JavaScript Arrays and Objects',
  'if-you-add-a-property-with-a-string-key': 'JavaScript Arrays and Objects',

  // Event propagation orphaned under "Working with DOM" → correct topic
  'what-is-the-difference-between-capturing': 'DOM Events and User Interaction',

  // Storage question misplaced in "Modern JavaScript (ES6+) Essentials"
  'which-storage-mechanism-is-cleared-autom': 'Storing Data in the Browser',

  // Error handling questions stuck at bottom of "Basics of Package Management"
  'what-type-of-error-occurs-when-a-variabl': 'Basic Error Handling',
  'which-block-in-a-trycatchfinally-s':       'Basic Error Handling',
  'which-keyword-is-used-to-manually-trigge': 'Basic Error Handling',
  'which-function-can-be-used-to-catch-glob': 'Basic Error Handling',
};

// ── Targeted content fixes ───────────────────────────────────────────────────

interface OptionFix {
  option: string;
  correct: boolean;
  comment?: string;
}
interface ContentFix {
  question?: string;
  level?: number;
  options?: OptionFix[];
}

const CONTENT_FIXES: Record<string, ContentFix> = {
  // Typo: first option was the letter "o" instead of the digit "0"
  'what-is-the-index-of-the-first-element-i': {
    options: [
      { option: '0', correct: true, comment: 'JavaScript arrays are zero-indexed — the first element is always at index 0.' },
      { option: '1', correct: false },
      { option: '-1', correct: false },
      { option: 'undefined', correct: false },
    ],
  },

  // "Both A and C" positional reference + "Var" capitalized incorrectly
  'which-of-the-following-keywords-is-used': {
    options: [
      { option: 'let', correct: false },
      { option: 'const', correct: false },
      { option: 'var', correct: false },
      { option: 'Both let and var', correct: true, comment: 'Both let and var allow reassignment. const does not — attempting to reassign a const throws a TypeError.' },
    ],
  },

  // Duplicate options: both C and D were "The request technically succeeded"
  'why-doesnt-fetch-reject-for-404-or-50': {
    options: [
      { option: 'It only rejects for JavaScript errors', correct: false },
      { option: 'It always ignores status codes', correct: false },
      { option: 'The request technically succeeded — the server responded', correct: true, comment: 'fetch() rejects only on network failures. A 404 or 500 response still means the server was reached and responded, so the Promise resolves — you must check response.ok yourself.' },
      { option: 'fetch() throws a TypeError for all non-200 statuses', correct: false },
    ],
  },

  // Only 3 options — add a fourth
  'which-of-these-best-describes-asyncawai': {
    options: [
      { option: 'It blocks JavaScript execution', correct: false },
      { option: 'It makes async code look synchronous', correct: true, comment: 'async/await is syntactic sugar over Promises. It lets you write asynchronous operations in a linear, readable style without nesting .then() chains.' },
      { option: 'It completely replaces Promises', correct: false },
      { option: 'It only works with the Fetch API', correct: false },
    ],
  },

  // Answer hint "a) Synchronously" leaked into the question text
  'in-es-modules-how-are-imports-loaded': {
    question: 'In ES Modules, how are imports loaded?',
    options: [
      { option: 'Synchronously, blocking further execution', correct: false },
      { option: 'Lazily, only when first called', correct: false },
      { option: 'Asynchronously, in the background', correct: true, comment: 'ES Modules are loaded asynchronously, which allows bundlers to perform static analysis and tree-shaking before code runs.' },
      { option: 'Only at runtime after the page loads', correct: false },
    ],
  },

  // Option values not capitalised consistently
  'which-devtools-panel-in-browsers-is-prim': {
    options: [
      { option: 'Elements', correct: false },
      { option: 'Sources', correct: true, comment: 'The Sources panel in Chrome/Edge DevTools is where you set breakpoints, step through code line-by-line, and inspect the call stack.' },
      { option: 'Network', correct: false },
      { option: 'Application', correct: false },
    ],
  },

  // can-objects level was 2; this is basic knowledge, should be level 1
  'can-objects-in-javascript-contain-functi': {
    level: 1,
    options: [
      { option: 'Yes, as methods', correct: true, comment: 'Functions stored as object properties are called methods. Example: const obj = { greet() { return "hi"; } }.' },
      { option: 'No', correct: false },
      { option: 'Only inside arrays', correct: false },
      { option: 'Only with special syntax', correct: false },
    ],
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function trim(s: string): string {
  return s.replace(/^[\s\n]+|[\s\n]+$/g, '');
}

function timeAllowed(level: number): number {
  if (level === 1) return 60;
  if (level === 2) return 75;
  return 90;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Reading questions-javascript.json...');
  const raw = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

  const originalCount = raw.questions.length;
  let removed = 0;
  let topicFixed = 0;
  let contentFixed = 0;

  const cleaned = raw.questions
    .filter((q: any) => {
      if (SLUGS_TO_REMOVE.has(q.slug)) { removed++; return false; }
      return true;
    })
    .map((q: any) => {
      // Systematic: strip whitespace, fix timeAllowed
      q.question    = trim(q.question);
      q.timeAllowed = timeAllowed(q.level);
      q.options     = q.options.map((o: any) => ({ ...o, option: trim(o.option) }));

      // Topic reassignment
      if (TOPIC_REASSIGNMENTS[q.slug]) {
        q.topicTitle = TOPIC_REASSIGNMENTS[q.slug];
        topicFixed++;
      }

      // Targeted content fixes
      const fix = CONTENT_FIXES[q.slug];
      if (fix) {
        if (fix.question !== undefined) q.question = fix.question;
        if (fix.level    !== undefined) { q.level = fix.level; q.timeAllowed = timeAllowed(fix.level); }
        if (fix.options  !== undefined) q.options = fix.options;
        contentFixed++;
      }

      return q;
    });

  const output = { subjectSlug: raw.subjectSlug, questions: cleaned };
  fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\nJSON fixes applied:`);
  console.log(`  ${originalCount} questions read`);
  console.log(`  ${removed} removed (test/empty/duplicate/wrong-answer)`);
  console.log(`  ${cleaned.length} remaining`);
  console.log(`  ${topicFixed} topic assignments corrected`);
  console.log(`  ${contentFixed} questions with targeted content fixes`);
  console.log(`\nWritten → ${JSON_PATH}`);

  // ── Delete removed questions from DB ──────────────────────────────────────

  console.log('\nConnecting to database to delete removed questions...');
  await AppDataSource.initialize();

  const slugList = [...SLUGS_TO_REMOVE].map(s => `'${s}'`).join(', ');

  // Delete options first (FK constraint), then questions
  // question_attempt.selectedOption → question_option → question (must delete attempts first)
  await AppDataSource.query(
    `DELETE qa FROM question_attempt qa
     INNER JOIN question_option qo ON qo.id = qa.selectedOption
     INNER JOIN question q ON q.id = qo.questionId
     WHERE q.slug IN (${slugList})`
  );

  await AppDataSource.query(
    `DELETE qo FROM question_option qo
     INNER JOIN question q ON q.id = qo.questionId
     WHERE q.slug IN (${slugList})`
  );

  await AppDataSource.query(
    `DELETE qt FROM question_topic qt
     INNER JOIN question q ON q.id = qt.questionId
     WHERE q.slug IN (${slugList})`
  );

  const qResult = await AppDataSource.query(
    `DELETE FROM question WHERE slug IN (${slugList})`
  );

  console.log(`  Deleted ${qResult.affectedRows ?? qResult[0]?.affectedRows ?? '?'} questions from DB`);
  console.log(`  (plus their options and topic links)`);

  await AppDataSource.destroy();

  console.log('\nDone. Now run:');
  console.log('  npm run import:questions -- src/database/seeds/questions-javascript.json --update\n');
}

main().catch(err => {
  console.error('\nScript failed:', err);
  process.exit(1);
});
