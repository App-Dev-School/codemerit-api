import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BadgeScopeEnum } from 'src/common/enum/badge-scope.enum';
import { BadgeSourceEnum } from 'src/common/enum/badge-source.enum';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { Badge } from 'src/common/typeorm/entities/badge.entity';
import { UserBadge } from 'src/common/typeorm/entities/user-badge.entity';
import { In, Repository } from 'typeorm';

export interface BadgeDto {
  code: string;
  name: string;
  description: string;
  iconUrl: string;
  points: number;
  scopeType: BadgeScopeEnum;
  scopeId: number | null;
  sortOrder: number;
  earnedAt: Date | null;
  source: BadgeSourceEnum | null;
}

export interface ScopedBadgeDto extends BadgeDto {
  unlocked: boolean;
}

/**
 * Read-only badge queries, split out from AchievementService specifically so modules that only
 * need to *read* badge/unlock state (e.g. MasterModule's subject/job-role dashboards) don't have
 * to import the whole AchievementModule — which itself imports MasterModule for
 * SubjectTrackAnalysisService/TopicAnalysisService, and would otherwise create a module cycle.
 * AchievementService.getUserBadges() delegates here so its existing callers are unaffected.
 */
@Injectable()
export class BadgeQueryService {
  constructor(
    @InjectRepository(Badge)
    private readonly badgeRepo: Repository<Badge>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepo: Repository<UserBadge>,
  ) {}

  /** A user's badge collection — earned ones (with earnedAt) plus the still-locked catalog
   * entries — optionally narrowed to one scope (e.g. only this subject's badges for a contextual
   * widget on the subject dashboard). Same scopeId-requires-scopeType validation as getBadgeCatalog. */
  async getUserBadges(
    userId: number,
    scopeType?: BadgeScopeEnum,
    scopeId?: number,
  ): Promise<{ earned: BadgeDto[]; locked: BadgeDto[] }> {
    if (scopeId !== undefined && !scopeType) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        'scopeType is required when scopeId is provided.',
      );
    }
    const where: Partial<Badge> = {};
    if (scopeType) where.scopeType = scopeType;
    if (scopeId !== undefined) where.scopeId = scopeId;

    const [allBadges, earned] = await Promise.all([
      this.badgeRepo.find({ where, order: { sortOrder: 'ASC', id: 'ASC' } }),
      this.userBadgeRepo.find({ where: { userId } }),
    ]);
    const earnedByBadgeId = new Map(earned.map((ub) => [ub.badgeId, ub]));

    const toDto = (badge: Badge): BadgeDto => {
      const ub = earnedByBadgeId.get(badge.id);
      return {
        code: badge.code,
        name: badge.name,
        description: badge.description,
        iconUrl: badge.iconUrl,
        points: badge.points,
        scopeType: badge.scopeType,
        scopeId: badge.scopeId,
        sortOrder: badge.sortOrder,
        earnedAt: ub?.earnedAt ?? null,
        source: ub?.source ?? null,
      };
    };

    return {
      earned: allBadges.filter((b) => earnedByBadgeId.has(b.id)).map(toDto),
      // Unpublished badges stay visible if already earned (history is never hidden), but drop
      // out of the "still to unlock" teaser list once disabled.
      locked: allBadges.filter((b) => !earnedByBadgeId.has(b.id) && b.isPublished).map(toDto),
    };
  }

  /** Flat, dashboard-friendly shape for embedding into subjectDashboard/programDetails/profile —
   * every badge for one scope (scopeId omitted entirely means GLOBAL badges, which have no id to
   * scope by), each tagged with whether this user has unlocked it. A single query ordered by
   * sortOrder — unlike deriving this from getUserBadges' earned/locked split (which would need
   * concatenating two independently-ordered arrays, breaking a unified sort), this queries and
   * sorts the whole scope's catalog once, then tags unlocked/earnedAt/source per badge.
   *
   * `userId` is optional: these endpoints are visitor-accessible (subjectDashboard/programDetails
   * are `@Public()` + `OptionalJwtAuthGuard`), and a visitor should still see *what badges can be
   * unlocked* for a subject/job role — just with everything correctly tagged `unlocked: false`
   * rather than the field disappearing entirely. Omitting `userId` skips the earned-lookup query
   * outright rather than passing `undefined` into the `where` clause, which TypeORM would treat as
   * "no filter" and match every user's earned rows — a real bug, not a hypothetical one.
   *
   * `isPublished` follows the same contract getUserBadges already uses: fetch the whole scope
   * unfiltered, then drop only the not-yet-earned unpublished ones — an already-earned badge stays
   * visible even after being unpublished (history isn't hidden), it just can't be newly unlocked. */
  async getUserBadgesForScope(
    scopeType: BadgeScopeEnum,
    scopeId?: number,
    userId?: number,
  ): Promise<ScopedBadgeDto[]> {
    const where: Partial<Badge> = { scopeType };
    if (scopeId !== undefined) where.scopeId = scopeId;

    const [badges, earned] = await Promise.all([
      this.badgeRepo.find({ where, order: { sortOrder: 'ASC', id: 'ASC' } }),
      userId ? this.userBadgeRepo.find({ where: { userId } }) : Promise.resolve([]),
    ]);
    const earnedByBadgeId = new Map(earned.map((ub) => [ub.badgeId, ub]));
    return badges
      .filter((b) => b.isPublished || earnedByBadgeId.has(b.id))
      .map((badge) => this.toScopedDto(badge, earnedByBadgeId));
  }

  /** Same idea as getUserBadgesForScope, but for multiple Subject scopes at once, grouped by
   * subjectId — used by job-role pages that show badges per-subject-card (e.g. programDetails'
   * `subjects[]` array) rather than one flat scope. A single bulk query, not one per subject —
   * matches the "fetch everything, then assemble per-entity from a map" pattern the rest of
   * ProgramService/SubjectStatsService already use for their own per-subject data. `userId` is
   * optional for the same visitor-accessible reason as getUserBadgesForScope above, and
   * `isPublished` follows the same earned-stays-visible contract too. */
  async getUserBadgesGroupedBySubject(
    subjectIds: number[],
    userId?: number,
  ): Promise<Map<number, ScopedBadgeDto[]>> {
    if (!subjectIds.length) return new Map();

    const [badges, earned] = await Promise.all([
      this.badgeRepo.find({
        where: { scopeType: BadgeScopeEnum.SUBJECT, scopeId: In(subjectIds) },
        order: { sortOrder: 'ASC', id: 'ASC' },
      }),
      userId ? this.userBadgeRepo.find({ where: { userId } }) : Promise.resolve([]),
    ]);
    const earnedByBadgeId = new Map(earned.map((ub) => [ub.badgeId, ub]));

    const bySubject = new Map<number, ScopedBadgeDto[]>();
    for (const badge of badges) {
      if (!badge.isPublished && !earnedByBadgeId.has(badge.id)) continue;
      const list = bySubject.get(badge.scopeId) ?? [];
      list.push(this.toScopedDto(badge, earnedByBadgeId));
      bySubject.set(badge.scopeId, list);
    }
    return bySubject;
  }

  private toScopedDto(badge: Badge, earnedByBadgeId: Map<number, UserBadge>): ScopedBadgeDto {
    const ub = earnedByBadgeId.get(badge.id);
    return {
      code: badge.code,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
      points: badge.points,
      scopeType: badge.scopeType,
      scopeId: badge.scopeId,
      sortOrder: badge.sortOrder,
      earnedAt: ub?.earnedAt ?? null,
      source: ub?.source ?? null,
      unlocked: !!ub,
    };
  }
}
