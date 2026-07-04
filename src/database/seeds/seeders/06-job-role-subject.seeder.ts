import { DataSource } from 'typeorm';
import { SubjectTagEnum } from 'src/common/enum/subject-tag.enum';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { JobRoleSubject } from 'src/common/typeorm/entities/job-role-subject.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';

interface JobRoleSubjectSeed {
  jobRoleSlug: string;
  subjectSlug: string;
  sortOrder: number;
  tag: SubjectTagEnum;
  note?: string;
}

const JOB_ROLE_SUBJECTS: JobRoleSubjectSeed[] = [
  // Frontend Developer
  { jobRoleSlug: 'frontend-developer', subjectSlug: 'javascript',    sortOrder: 1, tag: SubjectTagEnum.MANDATORY,    note: 'Core language for frontend development' },
  { jobRoleSlug: 'frontend-developer', subjectSlug: 'typescript',    sortOrder: 2, tag: SubjectTagEnum.MANDATORY,    note: 'Strongly recommended in modern frontend stacks' },
  { jobRoleSlug: 'frontend-developer', subjectSlug: 'sql-databases', sortOrder: 3, tag: SubjectTagEnum.OPTIONAL,     note: 'Useful for working with BFF patterns and APIs' },

  // Backend Developer
  { jobRoleSlug: 'backend-developer', subjectSlug: 'python',         sortOrder: 1, tag: SubjectTagEnum.MANDATORY,    note: 'Primary backend language' },
  { jobRoleSlug: 'backend-developer', subjectSlug: 'sql-databases',  sortOrder: 2, tag: SubjectTagEnum.MANDATORY,    note: 'Essential for data persistence and querying' },
  { jobRoleSlug: 'backend-developer', subjectSlug: 'system-design',  sortOrder: 3, tag: SubjectTagEnum.RECOMMENDED,  note: 'Critical for senior backend roles' },
  { jobRoleSlug: 'backend-developer', subjectSlug: 'javascript',     sortOrder: 4, tag: SubjectTagEnum.OPTIONAL,     note: 'Useful for Node.js or scripting tasks' },

  // Full Stack Developer
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'javascript',    sortOrder: 1, tag: SubjectTagEnum.MANDATORY,   note: 'Essential for both frontend and Node.js backend' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'typescript',    sortOrder: 2, tag: SubjectTagEnum.MANDATORY,   note: 'Industry standard in modern full-stack projects' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'python',        sortOrder: 3, tag: SubjectTagEnum.RECOMMENDED, note: 'Widely used for backend microservices' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'sql-databases', sortOrder: 4, tag: SubjectTagEnum.MANDATORY,   note: 'Core skill for designing and querying databases' },
  { jobRoleSlug: 'full-stack-developer', subjectSlug: 'system-design', sortOrder: 5, tag: SubjectTagEnum.RECOMMENDED, note: 'Important for architecting full-stack systems' },

  // Data Engineer
  { jobRoleSlug: 'data-engineer', subjectSlug: 'python',         sortOrder: 1, tag: SubjectTagEnum.MANDATORY,   note: 'Primary language for data pipelines and ETL' },
  { jobRoleSlug: 'data-engineer', subjectSlug: 'sql-databases',  sortOrder: 2, tag: SubjectTagEnum.MANDATORY,   note: 'Core skill for data querying and warehouse design' },
  { jobRoleSlug: 'data-engineer', subjectSlug: 'system-design',  sortOrder: 3, tag: SubjectTagEnum.RECOMMENDED, note: 'Required for designing scalable data infrastructure' },
];

export async function seedJobRoleSubjects(
  dataSource: DataSource,
  jobRoles: JobRole[],
  subjects: Subject[],
): Promise<void> {
  const repo = dataSource.getRepository(JobRoleSubject);
  const jobRoleMap = new Map(jobRoles.map((j) => [j.slug, j]));
  const subjectMap = new Map(subjects.map((s) => [s.slug, s]));

  let count = 0;

  for (const data of JOB_ROLE_SUBJECTS) {
    const jobRole = jobRoleMap.get(data.jobRoleSlug);
    const subject = subjectMap.get(data.subjectSlug);
    if (!jobRole || !subject) continue;

    const exists = await repo.findOne({
      where: { jobRoleId: jobRole.id, subjectId: subject.id },
    });
    if (!exists) {
      await repo.save(
        repo.create({
          jobRoleId: jobRole.id,
          subjectId: subject.id,
          sortOrder: data.sortOrder,
          tag: data.tag,
          note: data.note ?? null,
        }),
      );
      count++;
    }
  }

  console.log(`  ✔ Job Role Subjects: ${count} new links`);
}
