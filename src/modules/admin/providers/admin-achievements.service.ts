import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Certificate } from 'src/common/typeorm/entities/certificate.entity';
import { CertificationTrack } from 'src/common/typeorm/entities/certification-track.entity';
import { Badge } from 'src/common/typeorm/entities/badge.entity';
import { UserBadge } from 'src/common/typeorm/entities/user-badge.entity';
import { CertificateStatusEnum } from 'src/common/enum/certificate-status.enum';
import { BadgeScopeEnum } from 'src/common/enum/badge-scope.enum';

@Injectable()
export class AdminAchievementsService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepo: Repository<Certificate>,

    @InjectRepository(CertificationTrack)
    private readonly certificationTrackRepo: Repository<CertificationTrack>,

    @InjectRepository(Badge)
    private readonly badgeRepo: Repository<Badge>,

    @InjectRepository(UserBadge)
    private readonly userBadgeRepo: Repository<UserBadge>,
  ) {}

  async getAchievementStats() {
    const [certificates, badges] = await Promise.all([
      this.getCertificateStats(),
      this.getBadgeStats(),
    ]);

    return { certificates, badges };
  }

  private async getCertificateStats() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now);
    startOfMonth.setDate(now.getDate() - 29);
    startOfMonth.setHours(0, 0, 0, 0);

    const [baseStats, topTracksRaw] = await Promise.all([
      this.certificateRepo
        .createQueryBuilder('c')
        .select([
          `SUM(CASE WHEN c.status = :issued THEN 1 ELSE 0 END) as totalIssued`,
          `SUM(CASE WHEN c.status = :revoked THEN 1 ELSE 0 END) as totalRevoked`,
          `SUM(CASE WHEN c.status = :expired THEN 1 ELSE 0 END) as totalExpired`,
          `COUNT(DISTINCT CASE WHEN c.status = :issued THEN c.userId END) as uniqueHolders`,
          `SUM(CASE WHEN c.status = :issued AND c.issuedAt >= :startOfWeek THEN 1 ELSE 0 END) as issuedThisWeek`,
          `SUM(CASE WHEN c.status = :issued AND c.issuedAt >= :startOfMonth THEN 1 ELSE 0 END) as issuedThisMonth`,
        ])
        .setParameters({
          issued: CertificateStatusEnum.ISSUED,
          revoked: CertificateStatusEnum.REVOKED,
          expired: CertificateStatusEnum.EXPIRED,
          startOfWeek,
          startOfMonth,
        })
        .getRawOne(),
      this.certificateRepo
        .createQueryBuilder('c')
        .select(['c.certificationTrackId as trackId', 'COUNT(c.id) as issuedCount'])
        .where('c.status = :issued', { issued: CertificateStatusEnum.ISSUED })
        .groupBy('c.certificationTrackId')
        .orderBy('issuedCount', 'DESC')
        .limit(5)
        .getRawMany(),
    ]);

    const topCertificationTracks = await this.attachTrackTitles(topTracksRaw);

    return {
      totalIssued: +baseStats.totalIssued || 0,
      totalRevoked: +baseStats.totalRevoked || 0,
      totalExpired: +baseStats.totalExpired || 0,
      uniqueHolders: +baseStats.uniqueHolders || 0,
      issuedThisWeek: +baseStats.issuedThisWeek || 0,
      issuedThisMonth: +baseStats.issuedThisMonth || 0,
      topCertificationTracks,
    };
  }

  private async attachTrackTitles(rows: { trackId: string | number; issuedCount: string | number }[]) {
    if (!rows.length) return [];
    const trackIds = rows.map((r) => +r.trackId);
    const tracks = await this.certificationTrackRepo.findBy({ id: In(trackIds) });
    const titleById = new Map(tracks.map((t) => [t.id, t.title]));
    return rows.map((r) => ({
      id: +r.trackId,
      title: titleById.get(+r.trackId) ?? 'Unknown',
      issuedCount: +r.issuedCount,
    }));
  }

  private async getBadgeStats() {
    const [publishedBadges, totalAwardedResult, uniqueEarnersResult, scopeCountsRaw, topBadgesRaw] =
      await Promise.all([
        this.badgeRepo.find({
          where: { isPublished: true },
          select: ['id', 'code', 'name', 'scopeType'],
        }),
        this.userBadgeRepo.createQueryBuilder('ub').select('COUNT(ub.id)', 'total').getRawOne(),
        this.userBadgeRepo
          .createQueryBuilder('ub')
          .select('COUNT(DISTINCT ub.userId)', 'total')
          .getRawOne(),
        this.badgeRepo
          .createQueryBuilder('b')
          .select(['b.scopeType as scopeType', 'COUNT(b.id) as count'])
          .where('b.isPublished = true')
          .groupBy('b.scopeType')
          .getRawMany(),
        this.userBadgeRepo
          .createQueryBuilder('ub')
          .select(['ub.badgeId as badgeId', 'COUNT(ub.id) as earnCount'])
          .groupBy('ub.badgeId')
          .orderBy('earnCount', 'DESC')
          .limit(5)
          .getRawMany(),
      ]);

    const byScope = {
      global: 0,
      subject: 0,
      jobRole: 0,
      topic: 0,
    };
    for (const row of scopeCountsRaw) {
      const count = +row.count || 0;
      if (row.scopeType === BadgeScopeEnum.GLOBAL) byScope.global = count;
      else if (row.scopeType === BadgeScopeEnum.SUBJECT) byScope.subject = count;
      else if (row.scopeType === BadgeScopeEnum.JOBROLE) byScope.jobRole = count;
      else if (row.scopeType === BadgeScopeEnum.TOPIC) byScope.topic = count;
    }

    // Earn count for every published badge (defaulting to 0), used to derive both the
    // most-earned and rarest-earned lists from a single UserBadge scan.
    const badgeIds = publishedBadges.map((b) => b.id);
    const earnCountRows = badgeIds.length
      ? await this.userBadgeRepo
          .createQueryBuilder('ub')
          .select(['ub.badgeId as badgeId', 'COUNT(ub.id) as earnCount'])
          .where('ub.badgeId IN (:...badgeIds)', { badgeIds })
          .groupBy('ub.badgeId')
          .getRawMany()
      : [];
    const earnCountByBadgeId = new Map(earnCountRows.map((r) => [+r.badgeId, +r.earnCount]));
    const publishedWithCounts = publishedBadges.map((b) => ({
      code: b.code,
      name: b.name,
      scopeType: b.scopeType,
      earnCount: earnCountByBadgeId.get(b.id) ?? 0,
    }));

    const topBadges = await this.attachBadgeDetails(topBadgesRaw);
    const rareBadges = [...publishedWithCounts]
      .sort((a, b) => a.earnCount - b.earnCount)
      .slice(0, 5);

    return {
      totalAvailable: publishedBadges.length,
      totalAwarded: +totalAwardedResult.total || 0,
      uniqueEarners: +uniqueEarnersResult.total || 0,
      byScope,
      topBadges,
      rareBadges,
    };
  }

  private async attachBadgeDetails(rows: { badgeId: string | number; earnCount: string | number }[]) {
    if (!rows.length) return [];
    const badgeIds = rows.map((r) => +r.badgeId);
    const badges = await this.badgeRepo.findBy({ id: In(badgeIds) });
    const badgeById = new Map(badges.map((b) => [b.id, b]));
    return rows.map((r) => {
      const badge = badgeById.get(+r.badgeId);
      return {
        code: badge?.code ?? 'unknown',
        name: badge?.name ?? 'Unknown',
        scopeType: badge?.scopeType ?? null,
        earnCount: +r.earnCount,
      };
    });
  }
}
