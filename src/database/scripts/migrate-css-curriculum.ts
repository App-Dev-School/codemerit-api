import 'dotenv/config';
import { AppDataSource } from '../data-source';

/**
 * One-time migration: restructures the CSS curriculum.
 *
 * Changes:
 *   1. Renames "Flexbox & Grid" → "Flexbox" (slug: flexbox-grid → flexbox)
 *   2. Unpublishes "Modern CSS" and removes its subject track links
 *
 * After this script, run:
 *   npm run import:curriculum -- src/database/seeds/css-curriculum.json --update
 *
 * That will create "CSS Grid", update reordered topics, update track
 * descriptions, and add the CSS Grid link to the CSS Foundations track.
 */
async function main() {
  await AppDataSource.initialize();
  console.log('CSS curriculum migration starting...\n');

  const [subject] = await AppDataSource.query(
    `SELECT id FROM subject WHERE slug = 'css'`
  );
  if (!subject) throw new Error('CSS subject not found — is the DB seeded?');

  // 1. Rename "Flexbox & Grid" → "Flexbox"
  const [flexboxGrid] = await AppDataSource.query(
    `SELECT id FROM topic WHERE subjectId = ? AND title = 'Flexbox & Grid'`,
    [subject.id]
  );
  if (flexboxGrid) {
    await AppDataSource.query(
      `UPDATE topic SET title = 'Flexbox', slug = 'flexbox',
        shortDesc = '1D layouts with flex containers'
       WHERE id = ?`,
      [flexboxGrid.id]
    );
    console.log('✔  Renamed "Flexbox & Grid" → "Flexbox" (slug: flexbox)');
  } else {
    const [alreadyFlexbox] = await AppDataSource.query(
      `SELECT id FROM topic WHERE subjectId = ? AND title = 'Flexbox'`,
      [subject.id]
    );
    if (alreadyFlexbox) {
      console.log('–  "Flexbox" already exists, skipping rename');
    } else {
      console.warn('⚠  "Flexbox & Grid" not found — check topic titles in DB');
    }
  }

  // 2. Unpublish "Modern CSS" and remove its track links
  const [modernCSS] = await AppDataSource.query(
    `SELECT id FROM topic WHERE subjectId = ? AND title = 'Modern CSS'`,
    [subject.id]
  );
  if (modernCSS) {
    await AppDataSource.query(
      `DELETE FROM subject_track_topic WHERE topicId = ?`,
      [modernCSS.id]
    );
    await AppDataSource.query(
      `UPDATE topic SET isPublished = 0 WHERE id = ?`,
      [modernCSS.id]
    );
    console.log('✔  Unpublished "Modern CSS" and removed its subject track links');
  } else {
    console.log('–  "Modern CSS" not found, skipping');
  }

  console.log('\nMigration complete. Now run:');
  console.log('  npm run import:curriculum -- src/database/seeds/css-curriculum.json --update\n');

  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error('\nMigration failed:', err);
  process.exit(1);
});
