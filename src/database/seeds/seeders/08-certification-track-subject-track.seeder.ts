import { DataSource } from 'typeorm';
import { CertificationTrack } from 'src/common/typeorm/entities/certification-track.entity';
import { CertificationTrackSubjectTrack } from 'src/common/typeorm/entities/certification-track-subject-track.entity';
import { SubjectTrack } from 'src/common/typeorm/entities/subject-track.entity';
import { CERTIFICATION_TRACKS } from './07-certification-track.seeder';

// Maps "jobRoleSlug|certTrackTitle" → SubjectTrack slugs
const CERT_TRACK_SUBJECT_TRACK_MAP: Record<string, string[]> = {
  'frontend-developer|Frontend Fundamentals': ['js-foundations', 'ts-essentials'],
  'frontend-developer|Advanced Frontend':     ['js-advanced', 'ts-deep-dive'],

  'backend-developer|Backend Fundamentals':   ['python-basics', 'sql-foundations'],
  'backend-developer|API Developer':          ['python-intermediate', 'sql-advanced', 'sd-basics'],

  'full-stack-developer|Full Stack Foundation':  ['js-foundations', 'python-basics', 'sql-foundations'],
  'full-stack-developer|Full Stack Professional': ['js-advanced', 'ts-essentials', 'python-intermediate', 'sql-advanced'],

  'data-engineer|Data Engineering Basics':       ['python-basics', 'sql-foundations', 'sd-basics'],
  'data-engineer|Advanced Data Engineering':     ['python-intermediate', 'sql-advanced', 'sd-advanced'],
};

export async function seedCertificationTrackSubjectTracks(
  dataSource: DataSource,
  certTracks: CertificationTrack[],
  subjectTracks: SubjectTrack[],
): Promise<void> {
  const repo = dataSource.getRepository(CertificationTrackSubjectTrack);
  const subjectTrackMap = new Map(subjectTracks.map((t) => [t.slug, t]));

  // Build a lookup: "jobRoleSlug|certTrackTitle" → CertificationTrack entity
  const jobRoleRepo = dataSource.getRepository('JobRole');
  const certTrackLookup = new Map<string, CertificationTrack>();

  for (const certTrack of certTracks) {
    const jobRole = await jobRoleRepo.findOne({ where: { id: certTrack.jobRoleId } }) as any;
    if (jobRole) {
      certTrackLookup.set(`${jobRole.slug}|${certTrack.title}`, certTrack);
    }
  }

  let count = 0;

  for (const [key, subjectTrackSlugs] of Object.entries(CERT_TRACK_SUBJECT_TRACK_MAP)) {
    const certTrack = certTrackLookup.get(key);
    if (!certTrack) continue;

    for (const stSlug of subjectTrackSlugs) {
      const subjectTrack = subjectTrackMap.get(stSlug);
      if (!subjectTrack) continue;

      const exists = await repo.findOne({
        where: { certificationTrackId: certTrack.id, subjectTrackId: subjectTrack.id },
      });
      if (!exists) {
        await repo.save(
          repo.create({
            certificationTrackId: certTrack.id,
            subjectTrackId: subjectTrack.id,
          }),
        );
        count++;
      }
    }
  }

  console.log(`  ✔ Certification Track ↔ Subject Track: ${count} new links`);
}

export { CERTIFICATION_TRACKS };
