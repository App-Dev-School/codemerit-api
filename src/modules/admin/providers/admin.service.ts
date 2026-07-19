import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from 'src/common/typeorm/entities/activity.entity';
import { AdminPeopleService } from './admin-people.service';
import { AdminContentService } from './admin-content.service';
import { AdminEngagementService } from './admin-engagement.service';
import { AdminAchievementsService } from './admin-achievements.service';
import { AdminTrendsService } from './admin-trends.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,

    private readonly peopleService: AdminPeopleService,
    private readonly contentService: AdminContentService,
    private readonly engagementService: AdminEngagementService,
    private readonly achievementsService: AdminAchievementsService,
    private readonly trendsService: AdminTrendsService,
  ) {}

  async getDashboardSummary() {
    const [people, content, engagement, achievements, recentActivity, trends] = await Promise.all([
      this.peopleService.getPeopleStats(),
      this.contentService.getContentStats(),
      this.engagementService.getEngagementStats(),
      this.achievementsService.getAchievementStats(),
      this.getRecentActivity(),
      this.trendsService.getTrends(),
    ]);

    const overview = {
      totalUsers: people.users.total,
      activeUsers: people.users.active,
      newUsersToday: people.growth.newToday,
      totalPrograms: content.programs.total,
      totalCertificationTracks: content.certificationTracks.total,
      totalSubjectTracks: content.subjectTracks.total,
      totalSubjects: content.subjects.total,
      totalTopics: content.topics.total,
      totalQuestions: content.questions.total,
      totalQuizzes: engagement.quizzes.total,
      totalLessons: content.lessons.total,
      totalQuizAttempts: engagement.quizzes.totalPlays,
      totalQuestionAttempts: engagement.questionAttempts.total,
      certificatesIssued: achievements.certificates.totalIssued,
      badgesAwarded: achievements.badges.totalAwarded,
    };

    return {
      overview,
      people,
      content,
      engagement,
      achievements,
      recentActivity,
      trends,
    };
  }

  private async getRecentActivity(limit = 15) {
    const rows = await this.activityRepo
      .createQueryBuilder('activity')
      .leftJoin('activity.user', 'user')
      .select([
        'activity.id as id',
        'activity.title as title',
        'activity.message as message',
        'activity.userId as userId',
        'activity.dataType as dataType',
        'activity.dataId as dataId',
        'activity.createdAt as createdAt',
        'user.firstName as firstName',
        'user.lastName as lastName',
      ])
      .orderBy('activity.createdAt', 'DESC')
      .limit(limit)
      .getRawMany();

    return rows.map((r) => ({
      id: +r.id,
      title: r.title,
      message: r.message,
      userId: +r.userId,
      userName: [r.firstName, r.lastName].filter(Boolean).join(' ') || null,
      dataType: r.dataType ?? null,
      dataId: r.dataId !== null ? +r.dataId : null,
      createdAt: r.createdAt,
    }));
  }
}
