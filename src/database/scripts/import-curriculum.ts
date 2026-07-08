import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../data-source';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { SubjectTrack } from 'src/common/typeorm/entities/subject-track.entity';
import { SubjectTrackTopic } from 'src/common/typeorm/entities/subject-track-topic.entity';
import { TopicLabelEnum } from 'src/common/enum/topic-label.enum';
import { generateSlug } from 'src/common/utils/slugify.util';

interface TopicInput {
  title: string;
  description?: string;
  goal?: string;
  shortDesc?: string;
  label: string;
  order: number;
  weight: number;
  isPublished?: boolean;
}

interface SubjectTrackInput {
  title: string;
  description?: string;
  sortOrder: number;
  isPublished?: boolean;
  topicTitles: string[];
}

interface CurriculumFile {
  subjectSlug: string;
  topics: TopicInput[];
  subjectTracks: SubjectTrackInput[];
}

async function uniqueSlug(
  base: string,
  repo: { findOne: (opts: any) => Promise<any> },
  suffix: string,
): Promise<string> {
  const candidate = generateSlug(base);
  const taken = await repo.findOne({ where: { slug: candidate } });
  return taken ? `${candidate}-${suffix}` : candidate;
}

async function main() {
  const args       = process.argv.slice(2);
  const updateMode = args.includes('--update');
  const arg        = args.find((a) => !a.startsWith('-'));

  if (!arg) {
    console.error('Usage: npm run import:curriculum -- <file.json> [--update]');
    console.error('  --update  Patch metadata on existing topics and tracks (shortDesc, description,');
    console.error('            goal, order, weight, label, isPublished). Slugs and titles are never changed.');
    process.exit(1);
  }

  const filePath = path.isAbsolute(arg) ? arg : path.join(process.cwd(), arg);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const input: CurriculumFile = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  await AppDataSource.initialize();
  console.log(`Database connected.${updateMode ? ' (update mode)' : ''}\n`);

  const subjectRepo = AppDataSource.getRepository(Subject);
  const topicRepo   = AppDataSource.getRepository(Topic);
  const trackRepo   = AppDataSource.getRepository(SubjectTrack);
  const linkRepo    = AppDataSource.getRepository(SubjectTrackTopic);

  // ── Locate subject ────────────────────────────────────────────────────────
  const subject = await subjectRepo.findOne({ where: { slug: input.subjectSlug } });
  if (!subject) {
    console.error(`Subject with slug "${input.subjectSlug}" not found. Run the app once to auto-create tables, or check the slug.`);
    process.exit(1);
  }
  console.log(`Subject: ${subject.title} (id=${subject.id})\n`);

  // ── Import topics ─────────────────────────────────────────────────────────
  let topicsCreated = 0;
  let topicsUpdated = 0;
  let topicsSkipped = 0;
  const topicByTitle = new Map<string, Topic>();

  // Pre-load existing topics for this subject so we can match by title
  const existingTopics = await topicRepo.find({ where: { subjectId: subject.id } });
  for (const t of existingTopics) topicByTitle.set(t.title, t);

  for (const data of input.topics) {
    const existing = topicByTitle.get(data.title);

    if (existing) {
      if (updateMode) {
        await topicRepo.update(existing.id, {
          label:       (data.label as TopicLabelEnum) ?? existing.label,
          order:       data.order       ?? existing.order,
          weight:      data.weight      ?? existing.weight,
          shortDesc:   data.shortDesc   ?? null,
          description: data.description ?? null,
          goal:        data.goal        ?? null,
          isPublished: data.isPublished ?? existing.isPublished,
        });
        // Refresh in map so track-linking uses latest
        topicByTitle.set(data.title, { ...existing, ...data } as Topic);
        topicsUpdated++;
      } else {
        topicsSkipped++;
      }
      continue;
    }

    const slug = await uniqueSlug(data.title, topicRepo, String(subject.id));

    const saved = await topicRepo.save(
      topicRepo.create({
        title:       data.title,
        subjectId:   subject.id,
        slug,
        label:       (data.label as TopicLabelEnum) ?? TopicLabelEnum.Foundation,
        order:       data.order,
        weight:      data.weight,
        shortDesc:   data.shortDesc  ?? null,
        description: data.description ?? null,
        goal:        data.goal        ?? null,
        isPublished: data.isPublished ?? true,
      }),
    );

    topicByTitle.set(saved.title, saved);
    topicsCreated++;
  }

  const topicUpdateSummary = updateMode ? `, ${topicsUpdated} updated` : '';
  console.log(`Topics   : ${topicsCreated} created${topicUpdateSummary}, ${topicsSkipped} already existed`);

  // ── Import subject tracks ─────────────────────────────────────────────────
  let tracksCreated = 0;
  let tracksUpdated = 0;
  let tracksSkipped = 0;
  let linksCreated  = 0;
  let linksMissing  = 0;

  for (const data of input.subjectTracks) {
    let track = await trackRepo.findOne({
      where: { subjectId: subject.id, title: data.title },
    });

    if (!track) {
      const slug = await uniqueSlug(data.title, trackRepo, String(subject.id));
      track = await trackRepo.save(
        trackRepo.create({
          title:       data.title,
          slug,
          subjectId:   subject.id,
          description: data.description ?? null,
          sortOrder:   data.sortOrder,
          isPublished: data.isPublished ?? true,
        }),
      );
      tracksCreated++;
    } else if (updateMode) {
      await trackRepo.update(track.id, {
        description: data.description ?? null,
        sortOrder:   data.sortOrder   ?? track.sortOrder,
        isPublished: data.isPublished ?? track.isPublished,
      });
      tracksUpdated++;
    } else {
      tracksSkipped++;
    }

    for (const topicTitle of data.topicTitles) {
      const topic = topicByTitle.get(topicTitle);
      if (!topic) {
        console.warn(`  ⚠  Topic not found: "${topicTitle}" — skipped`);
        linksMissing++;
        continue;
      }

      const exists = await linkRepo.findOne({
        where: { subjectTrackId: track.id, topicId: topic.id },
      });
      if (!exists) {
        await linkRepo.save(
          linkRepo.create({ subjectTrackId: track.id, topicId: topic.id }),
        );
        linksCreated++;
      }
    }
  }

  const trackUpdateSummary = updateMode ? `, ${tracksUpdated} updated` : '';
  console.log(`Tracks   : ${tracksCreated} created${trackUpdateSummary}, ${tracksSkipped} already existed`);
  console.log(`Links    : ${linksCreated} created${linksMissing ? `, ${linksMissing} topic titles unresolved` : ''}`);
  console.log('\nDone.');

  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error('\nImport failed:', err);
  process.exit(1);
});
