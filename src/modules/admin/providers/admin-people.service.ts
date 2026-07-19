import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/common/typeorm/entities/user.entity';
import { UserStreak } from 'src/common/typeorm/entities/user-streak.entity';
import { AccountStatusEnum } from 'src/core/users/enums/account-status.enum';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';

@Injectable()
export class AdminPeopleService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(UserStreak)
    private readonly userStreakRepo: Repository<UserStreak>,
  ) {}

  async getPeopleStats() {
    const [users, growth, streaks, topLearners] = await Promise.all([
      this.getUserStats(),
      this.getGrowthStats(),
      this.getStreakStats(),
      this.getTopLearners(),
    ]);

    return { users, growth, streaks, topLearners };
  }

  private async getUserStats() {
    const result = await this.userRepo
      .createQueryBuilder('u')
      .select([
        'COUNT(u.id) as total',
        `SUM(CASE WHEN u.accountStatus = :active THEN 1 ELSE 0 END) as active`,
        `SUM(CASE WHEN u.accountStatus = :pending THEN 1 ELSE 0 END) as pending`,
        `SUM(CASE WHEN u.accountStatus = :blocked THEN 1 ELSE 0 END) as blocked`,
        `SUM(CASE WHEN u.role = :admin THEN 1 ELSE 0 END) as admins`,
        `SUM(CASE WHEN u.role = :moderator THEN 1 ELSE 0 END) as moderators`,
        `SUM(CASE WHEN u.role = :user THEN 1 ELSE 0 END) as learners`,
        `SUM(CASE WHEN u.designation IS NOT NULL THEN 1 ELSE 0 END) as withDesignation`,
      ])
      .setParameters({
        active: AccountStatusEnum.ACTIVE,
        pending: AccountStatusEnum.PENDING,
        blocked: AccountStatusEnum.BLOCKED,
        admin: UserRoleEnum.ADMIN,
        moderator: UserRoleEnum.MODERATOR,
        user: UserRoleEnum.USER,
      })
      .getRawOne();

    return {
      total: +result.total || 0,
      active: +result.active || 0,
      pending: +result.pending || 0,
      blocked: +result.blocked || 0,
      admins: +result.admins || 0,
      moderators: +result.moderators || 0,
      learners: +result.learners || 0,
      withDesignation: +result.withDesignation || 0,
    };
  }

  private async getGrowthStats() {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now);
    startOfMonth.setDate(now.getDate() - 29);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await this.userRepo
      .createQueryBuilder('u')
      .select([
        `SUM(CASE WHEN u.createdAt >= :startOfToday THEN 1 ELSE 0 END) as newToday`,
        `SUM(CASE WHEN u.createdAt >= :startOfWeek THEN 1 ELSE 0 END) as newThisWeek`,
        `SUM(CASE WHEN u.createdAt >= :startOfMonth THEN 1 ELSE 0 END) as newThisMonth`,
      ])
      .setParameters({ startOfToday, startOfWeek, startOfMonth })
      .getRawOne();

    return {
      newToday: +result.newToday || 0,
      newThisWeek: +result.newThisWeek || 0,
      newThisMonth: +result.newThisMonth || 0,
    };
  }

  private async getStreakStats() {
    const result = await this.userStreakRepo
      .createQueryBuilder('s')
      .select([
        `SUM(CASE WHEN s.currentStreak > 0 THEN 1 ELSE 0 END) as usersWithActiveStreak`,
        `AVG(s.currentStreak) as avgCurrentStreak`,
        `MAX(s.longestStreak) as longestStreakEver`,
      ])
      .getRawOne();

    return {
      usersWithActiveStreak: +result.usersWithActiveStreak || 0,
      avgCurrentStreak: result.avgCurrentStreak ? +(+result.avgCurrentStreak).toFixed(2) : 0,
      longestStreakEver: +result.longestStreakEver || 0,
    };
  }

  private async getTopLearners(limit = 5) {
    const learners = await this.userRepo
      .createQueryBuilder('u')
      .select([
        'u.id as id',
        'u.firstName as firstName',
        'u.lastName as lastName',
        'u.image as image',
        'u.level as level',
        'u.points as points',
      ])
      .where('u.points IS NOT NULL')
      .orderBy('u.points', 'DESC')
      .limit(limit)
      .getRawMany();

    return learners.map((l) => ({
      id: +l.id,
      name: [l.firstName, l.lastName].filter(Boolean).join(' '),
      image: l.image ?? null,
      level: l.level ?? null,
      points: +l.points || 0,
    }));
  }
}
