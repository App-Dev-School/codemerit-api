import 'dotenv/config';
import { AppDataSource } from '../data-source';

const SLUGS = [
  'javascript-can-only-be-used-for-front-en',
  'nodejs-is-required-to-run-javascript-in',
  'npm-comes-bundled-with-nodejs-installat',
  'browser-developer-tools-are-only-availab',
];

async function main() {
  await AppDataSource.initialize();
  const list = SLUGS.map(s => `'${s}'`).join(', ');
  await AppDataSource.query(`DELETE qa FROM question_attempt qa INNER JOIN question_option qo ON qo.id=qa.selectedOption INNER JOIN question q ON q.id=qo.questionId WHERE q.slug IN (${list})`);
  await AppDataSource.query(`DELETE qa FROM question_attempt qa INNER JOIN question q ON q.id=qa.questionId WHERE q.slug IN (${list})`);
  await AppDataSource.query(`DELETE qo FROM question_option qo INNER JOIN question q ON q.id=qo.questionId WHERE q.slug IN (${list})`);
  await AppDataSource.query(`DELETE qt FROM question_topic qt INNER JOIN question q ON q.id=qt.questionId WHERE q.slug IN (${list})`);
  const r = await AppDataSource.query(`DELETE FROM question WHERE slug IN (${list})`);
  console.log(`Deleted ${r.affectedRows} T/F questions`);
  await AppDataSource.destroy();
}
main().catch(e => { console.error(e.message); process.exit(1); });
