import { DataSource } from 'typeorm';
import { CertificationTrack } from 'src/common/typeorm/entities/certification-track.entity';
import { CertificationTrackSubjectTrack } from 'src/common/typeorm/entities/certification-track-subject-track.entity';
import { SubjectTrack } from 'src/common/typeorm/entities/subject-track.entity';

/**
 * Maps "jobRoleSlug|certTrackTitle" → SubjectTrack slugs that must be
 * completed to earn the certification track.
 *
 * Rules:
 * - Only reference subject track slugs that actually exist in the DB.
 * - Cert tracks for roles without subject tracks yet (HTML, CSS, Git, Java,
 *   DevOps) are intentionally omitted — add entries once those curricula
 *   are imported.
 * - Seeder 07 clears certification_track_subject_track before re-inserting
 *   cert tracks, so this seeder always starts with an empty junction table.
 */
const CERT_TRACK_SUBJECT_TRACK_MAP: Record<string, string[]> = {

  // ── Digital Literacy ──────────────────────────────────────────────────────
  'digital-literacy|Computer Ready':      ['computer-basics'],
  'digital-literacy|Digitally Connected': ['computer-basics', 'internet-essentials'],

  // ── Office Professional ───────────────────────────────────────────────────
  'office-professional|Office Starter': [
    'word-essentials',
    'excel-foundations',
  ],
  'office-professional|Office Proficient': [
    'word-essentials',
    'excel-foundations',
    'excel-intermediate',
    'powerpoint-skills',
  ],
  'office-professional|Data Entry Specialist': [
    'typing-data-entry',
    'data-management-productivity',
    'excel-foundations',
  ],
  'office-professional|Digital Office Expert': [
    'word-essentials',
    'excel-foundations',
    'internet-essentials',
    'digital-safety-productivity',
    'typing-data-entry',
  ],
  'office-professional|Computer Applications Professional': [
    'computer-basics',
    'pc-operations-security',
    'internet-essentials',
    'digital-safety-productivity',
    'word-essentials',
    'excel-foundations',
    'excel-intermediate',
    'powerpoint-skills',
    'typing-data-entry',
    'data-management-productivity',
  ],

  // ── Programmer Level 1 ────────────────────────────────────────────────────
  'programmer-1|CSS Aware':            ['css-foundations'],
  'programmer-1|JavaScript Starter':   ['js-foundations'],
  'programmer-1|Junior Web Programmer': ['js-foundations'],

  // ── Trainee Software Engineer ─────────────────────────────────────────────
  'trainee-software-engineer|JavaScript Starter': ['js-foundations'],
  'trainee-software-engineer|Tech Foundations':   ['js-foundations'],

  // ── Software Engineer ─────────────────────────────────────────────────────
  'software-engineer|JavaScript Programmer':        ['js-foundations', 'js-advanced'],
  'software-engineer|Software Engineering Foundations': ['js-foundations', 'ts-essentials'],

  // ── Web Developer ─────────────────────────────────────────────────────────
  'web-developer|CSS Stylist':             ['css-foundations', 'responsive-ui'],
  'web-developer|JavaScript Programmer':  ['js-foundations', 'js-advanced'],
  'web-developer|Certified Web Developer': ['js-foundations', 'js-advanced'],
  'web-developer|Tailwind Aware':         ['tailwind-foundations'],
  'web-developer|Tailwind UI Developer':  ['tailwind-foundations', 'tailwind-ui-developer'],

  // ── Frontend Developer ────────────────────────────────────────────────────
  'frontend-developer|CSS Intermediate':      ['css-foundations', 'responsive-ui'],
  'frontend-developer|JavaScript Programmer': ['js-foundations', 'js-advanced'],
  'frontend-developer|Expert UI Developer':   ['js-foundations', 'js-advanced'],
  'frontend-developer|Tailwind Aware':        ['tailwind-foundations'],
  'frontend-developer|Tailwind UI Developer': ['tailwind-foundations', 'tailwind-ui-developer'],

  // ── React Developer ───────────────────────────────────────────────────────
  'react-developer|JavaScript Programmer': ['js-foundations', 'js-advanced'],
  'react-developer|React Starter':         ['js-foundations'],
  'react-developer|React Developer':       ['js-foundations', 'js-advanced', 'ts-essentials'],
  'react-developer|React Expert':          ['js-foundations', 'js-advanced', 'ts-essentials', 'ts-deep-dive'],
  'react-developer|Tailwind Aware':        ['tailwind-foundations'],

  // ── Angular Developer ─────────────────────────────────────────────────────
  'angular-developer|JavaScript Programmer': ['js-foundations', 'js-advanced'],
  'angular-developer|Angular Starter':       ['js-foundations', 'ts-essentials'],
  'angular-developer|Angular Developer':     ['js-foundations', 'js-advanced', 'ts-essentials'],
  'angular-developer|Angular Expert':        ['js-foundations', 'js-advanced', 'ts-essentials', 'ts-deep-dive'],
  'angular-developer|Tailwind Aware':        ['tailwind-foundations'],

  // ── Node.js Developer ─────────────────────────────────────────────────────
  'nodejs-developer|JavaScript Programmer':    ['js-foundations', 'js-advanced'],
  'nodejs-developer|Node.js Developer':        ['js-foundations', 'js-advanced'],
  'nodejs-developer|Backend JavaScript Expert': ['js-foundations', 'js-advanced', 'ts-essentials', 'ts-deep-dive'],

  // ── Full Stack Developer ──────────────────────────────────────────────────
  'full-stack-developer|The Web Essentials':           ['js-foundations'],
  'full-stack-developer|JavaScript Programmer':        ['js-foundations', 'js-advanced'],
  'full-stack-developer|Full Stack JavaScript Developer': ['js-foundations', 'js-advanced', 'ts-essentials'],
  'full-stack-developer|Certified Full Stack Developer':  ['js-foundations', 'js-advanced', 'ts-essentials', 'ts-deep-dive'],
  'full-stack-developer|Tailwind Aware':               ['tailwind-foundations'],

  // ── Cloud Engineer ───────────────────────────────────────────────────────
  'cloud-engineer|Cloud Foundations': ['cloud-foundations', 'git-foundations', 'relational-db-foundations'],
  'cloud-engineer|Cloud Operations': ['cloud-operations', 'ci-cd-foundations', 'observability-reliability'],
  'cloud-engineer|Cloud Infrastructure Specialist': ['docker-foundations', 'kubernetes-basics', 'infrastructure-as-code'],

  // NOTE: python-developer, data-engineer, ai-ml-engineer, ml-engineer,
  // full-stack-dev-ai, devops-engineer, java-springboot-developer,
  // android-developer, ios-developer, mobile-app-developer, cloud-engineer,
  // qa-engineer, software-tester, program-manager do not yet have cert tracks
  // defined in seeder 07. Add entries here once those cert tracks are added.
};

export async function seedCertificationTrackSubjectTracks(
  dataSource: DataSource,
  certTracks: CertificationTrack[],
  subjectTracks: SubjectTrack[],
): Promise<void> {
  const repo = dataSource.getRepository(CertificationTrackSubjectTrack);
  const subjectTrackMap = new Map(subjectTracks.map((t) => [t.slug, t]));

  // Build lookup: "jobRoleSlug|certTrackTitle" → CertificationTrack entity
  const jobRoleRepo = dataSource.getRepository('JobRole');
  const certTrackLookup = new Map<string, CertificationTrack>();

  for (const certTrack of certTracks) {
    const jobRole = await jobRoleRepo.findOne({ where: { id: certTrack.jobRoleId } }) as any;
    if (jobRole) {
      certTrackLookup.set(`${jobRole.slug}|${certTrack.title}`, certTrack);
    }
  }

  let inserted = 0;
  let skippedTrack = 0;
  let skippedSubjectTrack = 0;

  for (const [key, subjectTrackSlugs] of Object.entries(CERT_TRACK_SUBJECT_TRACK_MAP)) {
    const certTrack = certTrackLookup.get(key);
    if (!certTrack) { skippedTrack++; continue; }

    for (const stSlug of subjectTrackSlugs) {
      const subjectTrack = subjectTrackMap.get(stSlug);
      if (!subjectTrack) { console.warn(`  ⚠  Subject track not found: "${stSlug}" (key: ${key})`); skippedSubjectTrack++; continue; }

      await repo.save(
        repo.create({
          certificationTrackId: certTrack.id,
          subjectTrackId: subjectTrack.id,
        }),
      );
      inserted++;
    }
  }

  if (skippedTrack)        console.warn(`  ⚠  ${skippedTrack} cert track key(s) not found in DB — check CERT_TRACK_SUBJECT_TRACK_MAP`);
  if (skippedSubjectTrack) console.warn(`  ⚠  ${skippedSubjectTrack} subject track slug(s) not found — run import:curriculum first`);
  console.log(`  ✔ Certification Track ↔ Subject Track: ${inserted} links`);
}
