import 'dotenv/config';
import { AppDataSource } from '../data-source';

const SLUGS = [
  'which-of-the-following-is-the-correct-sy-meyb9s6c',
  'what-is-one-advantage-of-using-vs-code-o',
  'why-is-npm-useful-in-javascript-projects',
  'what-is-the-main-difference-between-whil',
  'what-happens-if-a-function-does-not-have',
  'which-scope-type-applies-to-variables-de',
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
];

async function main() {
  await AppDataSource.initialize();
  const list = SLUGS.map(s => `'${s}'`).join(', ');

  // Delete attempts linked via selectedOption (FK to question_option)
  await AppDataSource.query(
    `DELETE qa FROM question_attempt qa
     INNER JOIN question_option qo ON qo.id = qa.selectedOption
     INNER JOIN question q ON q.id = qo.questionId
     WHERE q.slug IN (${list})`
  );
  // Delete attempts linked directly via questionId (FK to question)
  await AppDataSource.query(
    `DELETE qa FROM question_attempt qa
     INNER JOIN question q ON q.id = qa.questionId
     WHERE q.slug IN (${list})`
  );
  console.log('  ✔ question_attempt rows cleared');

  await AppDataSource.query(
    `DELETE qo FROM question_option qo
     INNER JOIN question q ON q.id = qo.questionId
     WHERE q.slug IN (${list})`
  );
  console.log('  ✔ question_option rows deleted');

  await AppDataSource.query(
    `DELETE qt FROM question_topic qt
     INNER JOIN question q ON q.id = qt.questionId
     WHERE q.slug IN (${list})`
  );
  console.log('  ✔ question_topic links deleted');

  const r = await AppDataSource.query(
    `DELETE FROM question WHERE slug IN (${list})`
  );
  console.log(`  ✔ ${r.affectedRows} questions deleted from DB`);

  await AppDataSource.destroy();
  console.log('\nDone. Now run:');
  console.log('  npm run import:questions -- src/database/seeds/questions-javascript.json --update\n');
}

main().catch(e => { console.error('\nFailed:', e.message); process.exit(1); });
