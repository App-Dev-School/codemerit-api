import { DataSource } from 'typeorm';
import { CertificationTrack } from 'src/common/typeorm/entities/certification-track.entity';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';

interface CertTrackSeed {
  jobRoleSlug: string;
  title: string;
  description: string;
  sortOrder: number;
  isPublished: boolean;
}

const CERTIFICATION_TRACKS: CertTrackSeed[] = [
  // Frontend Developer
  { jobRoleSlug: 'frontend-developer', title: 'Frontend Fundamentals', sortOrder: 1, isPublished: true, description: 'Build a solid foundation in JavaScript and TypeScript for modern frontend development.' },
  { jobRoleSlug: 'frontend-developer', title: 'Advanced Frontend', sortOrder: 2, isPublished: true, description: 'Master advanced JavaScript patterns, TypeScript generics, and scalable frontend architecture.' },

  // Backend Developer
  { jobRoleSlug: 'backend-developer', title: 'Backend Fundamentals', sortOrder: 1, isPublished: true, description: 'Core backend skills covering Python, SQL, and foundational system design concepts.' },
  { jobRoleSlug: 'backend-developer', title: 'API Developer', sortOrder: 2, isPublished: true, description: 'Design and build robust APIs with Python, advanced SQL, and system design principles.' },

  // Full Stack Developer
  { jobRoleSlug: 'full-stack-developer', title: 'Full Stack Foundation', sortOrder: 1, isPublished: true, description: 'Essential full-stack skills across JavaScript, Python, and SQL for building complete applications.' },
  { jobRoleSlug: 'full-stack-developer', title: 'Full Stack Professional', sortOrder: 2, isPublished: true, description: 'Advanced full-stack development with TypeScript, Python, and production-ready SQL skills.' },

  // Data Engineer
  { jobRoleSlug: 'data-engineer', title: 'Data Engineering Basics', sortOrder: 1, isPublished: true, description: 'Foundational skills in Python, SQL, and system design for building data pipelines.' },
  { jobRoleSlug: 'data-engineer', title: 'Advanced Data Engineering', sortOrder: 2, isPublished: true, description: 'Advanced data engineering covering intermediate Python, complex SQL, and distributed system design.' },
];

export interface CertTrackResult {
  entity: CertificationTrack;
  jobRoleSlug: string;
}

export async function seedCertificationTracks(
  dataSource: DataSource,
  jobRoles: JobRole[],
): Promise<CertificationTrack[]> {
  const repo = dataSource.getRepository(CertificationTrack);
  const jobRoleMap = new Map(jobRoles.map((j) => [j.slug, j]));

  for (const data of CERTIFICATION_TRACKS) {
    const jobRole = jobRoleMap.get(data.jobRoleSlug);
    if (!jobRole) continue;

    const exists = await repo.findOne({
      where: { jobRoleId: jobRole.id, title: data.title },
    });
    if (!exists) {
      await repo.save(
        repo.create({
          jobRoleId: jobRole.id,
          title: data.title,
          description: data.description,
          sortOrder: data.sortOrder,
          isPublished: data.isPublished,
        }),
      );
    }
  }

  const allTracks: CertificationTrack[] = [];
  for (const data of CERTIFICATION_TRACKS) {
    const jobRole = jobRoleMap.get(data.jobRoleSlug);
    if (!jobRole) continue;
    const track = await repo.findOne({
      where: { jobRoleId: jobRole.id, title: data.title },
    });
    if (track) allTracks.push(track);
  }

  console.log(`  ✔ Certification Tracks: ${allTracks.length} records`);
  return allTracks;
}

export { CERTIFICATION_TRACKS };
