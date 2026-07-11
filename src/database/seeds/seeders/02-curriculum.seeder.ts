import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { SubjectTrack } from 'src/common/typeorm/entities/subject-track.entity';
import { SubjectTrackTopic } from 'src/common/typeorm/entities/subject-track-topic.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { TopicLabelEnum } from 'src/common/enum/topic-label.enum';

const DATA_FILE = path.join(__dirname, '../data/02-curriculum.seed.json');

interface CurriculumData {
  topics: Array<{
    slug: string; title: string; subjectSlug: string; image: string | null; label: string | null;
    shortDesc: string | null; order: number; weight: number; popularity: number | null;
    parentSlug: string | null; isPublished: boolean; description: string | null; goal: string | null;
  }>;
  subjectTracks: Array<{
    slug: string; title: string; subjectSlug: string; description: string | null;
    sortOrder: number; isPublished: boolean;
  }>;
  subjectTrackTopics: Array<{ subjectTrackSlug: string; topicSlug: string }>;
}

export async function seedCurriculum(
  dataSource: DataSource,
  subjects: Subject[],
): Promise<{ topics: Topic[]; subjectTracks: SubjectTrack[] }> {
  const data: CurriculumData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const topicRepo = dataSource.getRepository(Topic);
  const trackRepo = dataSource.getRepository(SubjectTrack);
  const linkRepo = dataSource.getRepository(SubjectTrackTopic);
  const subjectBySlug = new Map(subjects.map((s) => [s.slug, s]));

  let topicsCreated = 0;
  for (const t of data.topics) {
    const subject = subjectBySlug.get(t.subjectSlug);
    if (!subject) {
      console.warn(`  ⚠  Topic "${t.slug}": subject "${t.subjectSlug}" not found`);
      continue;
    }
    const exists = await topicRepo.findOne({ where: { slug: t.slug } });
    if (!exists) {
      await topicRepo.save(
        topicRepo.create({
          slug: t.slug,
          title: t.title,
          subjectId: subject.id,
          image: t.image,
          label: (t.label as TopicLabelEnum) ?? undefined,
          shortDesc: t.shortDesc,
          order: t.order,
          weight: t.weight,
          popularity: t.popularity ?? undefined,
          isPublished: t.isPublished,
          description: t.description,
          goal: t.goal,
        }),
      );
      topicsCreated++;
    }
  }

  const topics = await topicRepo.find();
  const topicBySlug = new Map(topics.map((t) => [t.slug, t]));

  // Second pass — link parent topics now that every topic row exists.
  for (const t of data.topics) {
    if (!t.parentSlug) continue;
    const topic = topicBySlug.get(t.slug);
    const parent = topicBySlug.get(t.parentSlug);
    if (topic && parent && topic.parent !== parent.id) {
      await topicRepo.update(topic.id, { parent: parent.id });
    }
  }

  let tracksCreated = 0;
  for (const tr of data.subjectTracks) {
    const subject = subjectBySlug.get(tr.subjectSlug);
    if (!subject) {
      console.warn(`  ⚠  Track "${tr.slug}": subject "${tr.subjectSlug}" not found`);
      continue;
    }
    const exists = await trackRepo.findOne({ where: { slug: tr.slug } });
    if (!exists) {
      await trackRepo.save(
        trackRepo.create({
          slug: tr.slug,
          title: tr.title,
          subjectId: subject.id,
          description: tr.description,
          sortOrder: tr.sortOrder,
          isPublished: tr.isPublished,
        }),
      );
      tracksCreated++;
    }
  }

  const subjectTracks = await trackRepo.find();
  const trackBySlug = new Map(subjectTracks.map((t) => [t.slug, t]));

  let linksCreated = 0;
  for (const l of data.subjectTrackTopics) {
    const track = trackBySlug.get(l.subjectTrackSlug);
    const topic = topicBySlug.get(l.topicSlug);
    if (!track || !topic) continue;
    const exists = await linkRepo.findOne({ where: { subjectTrackId: track.id, topicId: topic.id } });
    if (!exists) {
      await linkRepo.save(linkRepo.create({ subjectTrackId: track.id, topicId: topic.id }));
      linksCreated++;
    }
  }

  console.log(`  ✔ Topics            : ${topics.length} records (${topicsCreated} created)`);
  console.log(`  ✔ Subject tracks    : ${subjectTracks.length} records (${tracksCreated} created)`);
  console.log(`  ✔ Track-topic links : ${data.subjectTrackTopics.length} declared (${linksCreated} created)`);
  return { topics, subjectTracks };
}
