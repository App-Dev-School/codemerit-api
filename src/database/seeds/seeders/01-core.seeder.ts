import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';

const DATA_FILE = path.join(__dirname, '../data/01-core.seed.json');

interface CoreData {
  jobRoles: Array<{
    title: string; slug: string; description: string | null; body: string | null;
    scope: string | null; orderId: number; image: string | null; color: string | null; isPublished: boolean;
  }>;
  subjects: Array<{
    title: string; slug: string; description: string | null; body: string | null;
    scope: string | null; image: string | null; color: string | null; isPublished: boolean;
  }>;
}

export async function seedCore(dataSource: DataSource): Promise<{ jobRoles: JobRole[]; subjects: Subject[] }> {
  const data: CoreData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const jobRoleRepo = dataSource.getRepository(JobRole);
  const subjectRepo = dataSource.getRepository(Subject);

  let jrCreated = 0;
  for (const j of data.jobRoles) {
    const exists = await jobRoleRepo.findOne({ where: { slug: j.slug } });
    if (!exists) {
      await jobRoleRepo.save(jobRoleRepo.create(j));
      jrCreated++;
    }
  }

  let subCreated = 0;
  for (const s of data.subjects) {
    const exists = await subjectRepo.findOne({ where: { slug: s.slug } });
    if (!exists) {
      await subjectRepo.save(subjectRepo.create(s));
      subCreated++;
    }
  }

  const jobRoles = await jobRoleRepo.find();
  const subjects = await subjectRepo.find();
  console.log(`  ✔ Job roles: ${jobRoles.length} records (${jrCreated} created)`);
  console.log(`  ✔ Subjects : ${subjects.length} records (${subCreated} created)`);
  return { jobRoles, subjects };
}
