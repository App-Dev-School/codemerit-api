import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { AppDataSource } from '../data-source';
import { seedJobRoles } from './seeders/02-job-role.seeder';
import { seedSubjectTracks } from './seeders/04-subject-track.seeder';
import { seedSubjectTrackTopics } from './seeders/05-subject-track-topic.seeder';
import { seedJobRoleSubjects } from './seeders/06-job-role-subject.seeder';
import { seedCertificationTracks } from './seeders/07-certification-track.seeder';
import { seedCertificationTrackSubjectTracks } from './seeders/08-certification-track-subject-track.seeder';

// Subjects, JobRoles, and Topics already exist in the DB — we only seed new entities.
// NOTE: SubjectTrack seeder matches subjects by slug. If your existing subjects have
// different slugs than those defined in 04-subject-track.seeder.ts, update the
// `subjectSlug` values there to match your DB.
// Similarly update TRACK_TOPIC_MAP in 05-subject-track-topic.seeder.ts to use
// your actual topic slugs.

async function main() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.\n');

    console.log('Fetching existing data from DB...');
    const subjects = await AppDataSource.getRepository(Subject).find();
    const topics   = await AppDataSource.getRepository(Topic).find();

    console.log('Seeding job roles...');
    const jobRoles = await seedJobRoles(AppDataSource);
    console.log(`  ${subjects.length} subjects | ${jobRoles.length} job roles | ${topics.length} topics\n`);

    console.log('Seeding new entities...');
    const subjectTracks = await seedSubjectTracks(AppDataSource, subjects);
    await seedSubjectTrackTopics(AppDataSource, subjectTracks, topics);
    await seedJobRoleSubjects(AppDataSource, jobRoles, subjects);

    const certTracks = await seedCertificationTracks(AppDataSource, jobRoles);
    await seedCertificationTrackSubjectTracks(AppDataSource, certTracks, subjectTracks);

    console.log('\nDone.');
  } catch (err) {
    console.error('\nSeeding failed:', err);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

main();
