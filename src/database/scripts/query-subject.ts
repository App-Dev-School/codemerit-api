import 'dotenv/config';
import { AppDataSource } from '../data-source';

async function run() {
  const subjectId = process.argv[2];
  if (!subjectId) { console.error('Usage: ts-node query-subject.ts <subjectId|slug>'); process.exit(1); }

  await AppDataSource.initialize();

  const isId = /^\d+$/.test(subjectId);
  const [subject] = await AppDataSource.query(
    isId
      ? `SELECT id, title, slug, isPublished FROM subject WHERE id = ${subjectId}`
      : `SELECT id, title, slug, isPublished FROM subject WHERE slug = '${subjectId}'`
  );
  if (!subject) { console.error('Subject not found'); process.exit(1); }
  console.log('\nSUBJECT:', JSON.stringify(subject));

  const topics = await AppDataSource.query(
    `SELECT id, title, slug, label, \`order\`, shortDesc, isPublished FROM topic WHERE subjectId = ${subject.id} ORDER BY \`order\``
  );
  console.log(`\nTOPICS (${topics.length}):`);
  topics.forEach((t: any) => console.log(JSON.stringify(t)));

  const tracks = await AppDataSource.query(
    `SELECT id, title, slug, sortOrder, isPublished FROM subject_track WHERE subjectId = ${subject.id} ORDER BY sortOrder`
  );
  console.log(`\nTRACKS (${tracks.length}):`);
  tracks.forEach((t: any) => console.log(JSON.stringify(t)));

  if (tracks.length) {
    console.log('\nTRACK → TOPIC LINKS:');
    for (const tr of tracks) {
      const links = await AppDataSource.query(
        `SELECT t.title, t.label FROM subject_track_topic stt JOIN topic t ON t.id = stt.topicId WHERE stt.subjectTrackId = ${tr.id} ORDER BY stt.id`
      );
      console.log(`  [${tr.title}]: ${links.map((l: any) => l.title).join(' | ')}`);
    }
  }

  await AppDataSource.destroy();
}
run().catch(e => { console.error(e.message); process.exit(1); });
