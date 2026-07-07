import { DataSource } from 'typeorm';
import { SubjectTrack } from 'src/common/typeorm/entities/subject-track.entity';
import { SubjectTrackTopic } from 'src/common/typeorm/entities/subject-track-topic.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';

// Maps each SubjectTrack slug to the Topic slugs it contains
const TRACK_TOPIC_MAP: Record<string, string[]> = {
  'js-foundations':    ['js-variables-scope', 'js-functions-closures', 'js-dom-manipulation', 'js-error-handling'],
  'js-advanced':       ['js-promises-async', 'js-event-loop', 'js-prototype-inheritance', 'js-es6-features'],
  'ts-essentials':     ['ts-type-system', 'ts-interfaces', 'ts-utility-types'],
  'ts-deep-dive':      ['ts-generics', 'ts-decorators', 'ts-advanced-types'],
  'python-basics':     ['py-data-types', 'py-functions-scope', 'py-list-comprehension', 'py-error-handling'],
  'python-intermediate': ['py-oop', 'py-modules-packages', 'py-generators'],
  'sql-foundations':   ['sql-select-queries', 'sql-joins', 'sql-aggregation'],
  'sql-advanced':      ['sql-indexes', 'sql-transactions', 'sql-stored-procedures', 'sql-normalization'],
  'sd-basics':         ['sd-scalability', 'sd-load-balancing', 'sd-api-design'],
  'sd-advanced':       ['sd-caching', 'sd-database-design', 'sd-microservices', 'sd-message-queues'],
};

export async function seedSubjectTrackTopics(
  dataSource: DataSource,
  subjectTracks: SubjectTrack[],
  topics: Topic[],
): Promise<void> {
  const repo = dataSource.getRepository(SubjectTrackTopic);
  const trackMap = new Map(subjectTracks.map((t) => [t.slug, t]));
  const topicMap = new Map(topics.map((t) => [t.slug, t]));

  let count = 0;

  for (const [trackSlug, topicSlugs] of Object.entries(TRACK_TOPIC_MAP)) {
    const track = trackMap.get(trackSlug);
    if (!track) continue;

    for (const topicSlug of topicSlugs) {
      const topic = topicMap.get(topicSlug);
      if (!topic) continue;

      const exists = await repo.findOne({
        where: { subjectTrackId: track.id, topicId: topic.id },
      });
      if (!exists) {
        await repo.save(repo.create({ subjectTrackId: track.id, topicId: topic.id }));
        count++;
      }
    }
  }

  console.log(`  ✔ Subject Track Topics: ${count} new links`);
}
