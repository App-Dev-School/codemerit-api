import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Badge } from 'src/common/typeorm/entities/badge.entity';
import { BadgeRule } from 'src/common/typeorm/entities/badge-rule.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { BadgeAwardMethodEnum } from 'src/common/enum/badge-award-method.enum';
import { BadgeRuleMetricEnum } from 'src/common/enum/badge-rule-metric.enum';
import { BadgeScopeEnum } from 'src/common/enum/badge-scope.enum';
import { DifficultyLevelEnum } from 'src/common/enum/difficulty-lavel.enum';

const DATA_FILE = path.join(__dirname, '../data/06-badges.seed.json');

const DIFFICULTY_BY_NAME: Record<string, DifficultyLevelEnum> = {
  Easy: DifficultyLevelEnum.Easy,
  Intermediate: DifficultyLevelEnum.Intermediate,
  Advanced: DifficultyLevelEnum.Advanced,
};

interface BadgeRuleSeed {
  metric: BadgeRuleMetricEnum;
  threshold: number;
  /** "Easy" | "Intermediate" | "Advanced" — omit for "all levels combined". */
  difficultyLevel?: string;
}

interface BadgeSeed {
  code: string;
  name: string;
  description: string;
  content: string;
  iconUrl: string;
  points: number;
  awardMethod?: BadgeAwardMethodEnum;
  isManuallyGrantable?: boolean;
  isPublished?: boolean;
  /** Display order within this badge's own scope (e.g. among one subject's badges) — lower
   * sorts first. Easiest-to-earn badge in a scope should get the lowest number. */
  sortOrder?: number;
  scopeType?: BadgeScopeEnum;
  /** Resolved to Subject.id at seed time — only meaningful when scopeType === Subject. */
  scopeSubjectSlug?: string;
  /** Resolved to Topic.id at seed time — only meaningful when scopeType === Topic. */
  scopeTopicSlug?: string;
  rule?: BadgeRuleSeed;
}

interface BadgesData {
  badges: BadgeSeed[];
}

export async function seedBadges(dataSource: DataSource): Promise<void> {
  const data: BadgesData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const badgeRepo = dataSource.getRepository(Badge);
  const badgeRuleRepo = dataSource.getRepository(BadgeRule);
  const subjectRepo = dataSource.getRepository(Subject);
  const topicRepo = dataSource.getRepository(Topic);

  let created = 0;
  let rulesCreated = 0;
  for (const b of data.badges) {
    let scopeId: number | null = null;
    if (b.scopeType === BadgeScopeEnum.SUBJECT && b.scopeSubjectSlug) {
      const subject = await subjectRepo.findOne({ where: { slug: b.scopeSubjectSlug } });
      if (!subject) {
        console.warn(`  ! Badge "${b.code}": subject slug "${b.scopeSubjectSlug}" not found, skipping.`);
        continue;
      }
      scopeId = subject.id;
    } else if (b.scopeType === BadgeScopeEnum.TOPIC && b.scopeTopicSlug) {
      const topic = await topicRepo.findOne({ where: { slug: b.scopeTopicSlug } });
      if (!topic) {
        console.warn(`  ! Badge "${b.code}": topic slug "${b.scopeTopicSlug}" not found, skipping.`);
        continue;
      }
      scopeId = topic.id;
    }

    const badgeData = {
      code: b.code,
      name: b.name,
      description: b.description,
      content: b.content,
      iconUrl: b.iconUrl,
      points: b.points,
      awardMethod: b.awardMethod ?? BadgeAwardMethodEnum.SYSTEM,
      isManuallyGrantable: b.isManuallyGrantable ?? false,
      isPublished: b.isPublished ?? true,
      sortOrder: b.sortOrder ?? 0,
      scopeType: b.scopeType ?? BadgeScopeEnum.GLOBAL,
      scopeId,
    };

    // Insert-only, forever — never overwrite an existing badge's data (see the
    // synchronize-corruption incident this convention exists to guard against downstream of).
    let badge = await badgeRepo.findOne({ where: { code: b.code } });
    if (!badge) {
      badge = await badgeRepo.save(badgeRepo.create(badgeData));
      created++;
    }

    // Same insert-only rule for BadgeRule — but this also lets an EXISTING badge (e.g. one
    // created before rules existed) pick up its rule on a later seed run, since a *missing* rule
    // row isn't "existing data" to protect the same way an already-set one is.
    if (b.rule) {
      const existingRule = await badgeRuleRepo.findOne({ where: { badgeId: badge.id } });
      if (!existingRule) {
        const difficultyLevel = b.rule.difficultyLevel
          ? (DIFFICULTY_BY_NAME[b.rule.difficultyLevel] ?? null)
          : null;
        await badgeRuleRepo.save(
          badgeRuleRepo.create({
            badgeId: badge.id,
            metric: b.rule.metric,
            threshold: b.rule.threshold,
            difficultyLevel,
          }),
        );
        rulesCreated++;
      }
    }
  }

  const badges = await badgeRepo.find();
  const rules = await badgeRuleRepo.find();
  console.log(
    `  ✔ Badges: ${badges.length} records (${created} created); Rules: ${rules.length} records (${rulesCreated} created)`,
  );
}
