import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CERT_ACHIEVED } from 'src/common/constants/completion-thresholds';
import { Badge } from 'src/common/typeorm/entities/badge.entity';
import { Certificate } from 'src/common/typeorm/entities/certificate.entity';
import { CertificationTrack } from 'src/common/typeorm/entities/certification-track.entity';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { QuizResult } from 'src/common/typeorm/entities/quiz-result.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { UserBadge } from 'src/common/typeorm/entities/user-badge.entity';
import { UserStreak } from 'src/common/typeorm/entities/user-streak.entity';
import { UserXpLog } from 'src/common/typeorm/entities/user-xp-log.entity';
import { generate6DigitNumber } from 'src/common/utils/common-functions';
import { ActivityService } from 'src/modules/activity/providers/activity/activity.service';
import { NotificationService } from 'src/modules/notification/providers/notification.service';
import { In, Repository } from 'typeorm';
import { SubjectTrackAnalysisService } from '../../master/providers/subject-track-analysis.service';
import { TopicAnalysisService } from '../../master/providers/topic-analysis.service';
import {
  BADGE_CODES,
  computeLevel,
  LevelTier,
  STREAK_MILESTONES,
  XP_HINT_PENALTY_MULTIPLIER,
  XP_PER_CORRECT,
  XP_PERFECT_SCORE_BONUS,
  XP_QUIZ_COMPLETION_BONUS,
} from '../constants/gamification.constants';
import { NewlyEarnedDto } from '../dtos/newly-earned.dto';

export interface EvaluateAfterQuizAttempt {
  id: number; // the just-saved QuestionAttempt row id — used to distinguish "this
              // batch's own rows" from any prior attempts when checking whether a
              // correct answer is genuinely new (see awardXpAndLevel()).
  questionId: number;
  isCorrect: boolean;
  isSkipped: boolean;
  hintUsed: boolean;
}

export interface EvaluateAfterQuizParams {
  userId: number;
  score: number;
  attempts: EvaluateAfterQuizAttempt[];
}

/** Badges earned so far this evaluation, plus the set of codes the user already had
 * before it started — threaded through every step so each can award independently
 * without re-querying or double-awarding within the same evaluation. */
interface BadgeContext {
  alreadyEarned: Set<string>;
  badgesEarned: { code: string; name: string }[];
}

interface XpResult {
  xpAwarded: number;
  totalPoints: number;
  levelBefore: LevelTier;
  levelAfter: LevelTier;
  leveledUp: boolean;
}

interface StreakResult {
  streak: UserStreak;
  milestoneHit?: number;
}

@Injectable()
export class AchievementService {
  private readonly logger = new Logger(AchievementService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(Certificate)
    private readonly certificateRepo: Repository<Certificate>,
    @InjectRepository(CertificationTrack)
    private readonly certificationTrackRepo: Repository<CertificationTrack>,
    @InjectRepository(Badge)
    private readonly badgeRepo: Repository<Badge>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepo: Repository<UserBadge>,
    @InjectRepository(UserStreak)
    private readonly userStreakRepo: Repository<UserStreak>,
    @InjectRepository(UserXpLog)
    private readonly userXpLogRepo: Repository<UserXpLog>,
    @InjectRepository(QuizResult)
    private readonly quizResultRepo: Repository<QuizResult>,
    @InjectRepository(QuestionAttempt)
    private readonly questionAttemptRepo: Repository<QuestionAttempt>,
    private readonly subjectTrackAnalyzer: SubjectTrackAnalysisService,
    private readonly topicAnalyzer: TopicAnalysisService,
    private readonly notificationService: NotificationService,
    private readonly activityService: ActivityService,
  ) {}

  /**
   * Runs every gamification consequence of a single quiz submission, in order:
   * XP/level, streak, then badges (streak milestone, first-quiz, perfect-score,
   * subject-mastered), then certification. Each step is a named method below —
   * this method is just the orchestration, not the logic itself.
   */
  async evaluateAfterQuiz(params: EvaluateAfterQuizParams): Promise<NewlyEarnedDto> {
    const { userId, score, attempts } = params;

    const badgeContext: BadgeContext = {
      alreadyEarned: new Set(
        (await this.userBadgeRepo.find({ where: { userId }, relations: ['badge'] })).map(
          (ub) => ub.badge.code,
        ),
      ),
      badgesEarned: [],
    };

    const questionIds = [...new Set(attempts.map((a) => a.questionId))];
    const questions = questionIds.length
      ? await this.questionRepo.find({ where: { id: In(questionIds) } })
      : [];

    const xp = await this.awardXpAndLevel(userId, score, attempts, questions);
    const streakResult = await this.updateStreak(userId);

    if (streakResult.milestoneHit) {
      await this.notificationService.notifyStreakMilestone(userId, streakResult.milestoneHit);
      await this.activityService.createActivity(
        userId,
        'Streak Milestone',
        `You're on a ${streakResult.milestoneHit}-day streak!`,
      );
      await this.awardBadgeIfNew(userId, `streak_${streakResult.milestoneHit}`, badgeContext);
    }

    await this.evaluateFirstQuizAndPerfectScoreBadges(userId, score, badgeContext);

    const subjectIds = [...new Set(questions.map((q) => q.subjectId))];
    await this.evaluateSubjectMasteredBadge(userId, subjectIds, badgeContext);

    const certificatesEarned = await this.evaluateCertifications(userId, subjectIds);
    if (certificatesEarned.length) {
      await this.awardBadgeIfNew(userId, BADGE_CODES.CERT_EARNED, badgeContext);
    }

    return {
      xpAwarded: xp.xpAwarded,
      totalPoints: xp.totalPoints,
      level: xp.levelAfter,
      leveledUp: xp.leveledUp,
      streak: {
        current: streakResult.streak.currentStreak,
        longest: streakResult.streak.longestStreak,
        milestoneHit: streakResult.milestoneHit,
      },
      badgesEarned: badgeContext.badgesEarned,
      certificatesEarned,
    };
  }

  /**
   * XP is deduplicated per-question, forever: a question only ever pays out the
   * first time it's answered correctly (excluding this batch's own just-saved
   * attempt ids, so first-time mastery *in this submission* still counts) —
   * otherwise XP could be farmed by wrapping an already-mastered question in a
   * new quiz indefinitely (maxAttempts is enforced per quiz, not per question).
   * The flat completion/perfect-score bonuses are gated the same way: nothing new
   * learned this submission means 0 XP, full stop, closing that loophole entirely.
   */
  private async awardXpAndLevel(
    userId: number,
    score: number,
    attempts: EvaluateAfterQuizAttempt[],
    questions: Question[],
  ): Promise<XpResult> {
    const questionById = new Map(questions.map((q) => [q.id, q]));

    const correctQuestionIds = [
      ...new Set(attempts.filter((a) => a.isCorrect && !a.isSkipped).map((a) => a.questionId)),
    ];
    const thisBatchIds = attempts.map((a) => a.id);

    let alreadyMasteredQuestionIds = new Set<number>();
    if (correctQuestionIds.length) {
      const priorCorrectRows = await this.questionAttemptRepo
        .createQueryBuilder('qa')
        .select('DISTINCT qa.questionId', 'questionId')
        .where('qa.userId = :userId', { userId })
        .andWhere('qa.questionId IN (:...questionIds)', { questionIds: correctQuestionIds })
        .andWhere('qa.isCorrect = 1')
        .andWhere('qa.id NOT IN (:...thisBatchIds)', {
          thisBatchIds: thisBatchIds.length ? thisBatchIds : [0],
        })
        .getRawMany();
      alreadyMasteredQuestionIds = new Set(priorCorrectRows.map((r) => +r.questionId));
    }
    const newlyMasteredQuestionIds = correctQuestionIds.filter(
      (qid) => !alreadyMasteredQuestionIds.has(qid),
    );

    let xpAwarded = 0;
    for (const questionId of newlyMasteredQuestionIds) {
      const level = questionById.get(questionId)?.level ?? 1;
      const base = XP_PER_CORRECT[level] ?? XP_PER_CORRECT[1];
      const attempt = attempts.find((a) => a.questionId === questionId && a.isCorrect && !a.isSkipped);
      xpAwarded += Math.round(base * (attempt?.hintUsed ? XP_HINT_PENALTY_MULTIPLIER : 1));
    }
    if (newlyMasteredQuestionIds.length > 0) {
      xpAwarded += XP_QUIZ_COMPLETION_BONUS;
      if (score === 100) xpAwarded += XP_PERFECT_SCORE_BONUS;
    }

    const user = await this.userRepo.findOne({ where: { id: userId }, select: ['id', 'points'] });
    const oldPoints = user?.points ?? 0;
    const totalPoints = oldPoints + xpAwarded;
    await this.userRepo.update(userId, { points: totalPoints });
    // Timestamped ledger entry — User.points has no history, so weekly/monthly
    // leaderboards need this to sum XP within a date range. Skip zero-XP events,
    // there's nothing to aggregate from them.
    if (xpAwarded > 0) {
      await this.userXpLogRepo.save(this.userXpLogRepo.create({ userId, xpAwarded }));
    }

    const levelBefore = computeLevel(oldPoints);
    const levelAfter = computeLevel(totalPoints);
    const leveledUp = levelAfter.level > levelBefore.level;
    if (leveledUp) {
      await this.notificationService.notifyLevelUp(userId, levelAfter.level, levelAfter.title);
      await this.activityService.createActivity(
        userId,
        'Level Up',
        `You reached Level ${levelAfter.level}: ${levelAfter.title}.`,
      );
    }

    return { xpAwarded, totalPoints, levelBefore, levelAfter, leveledUp };
  }

  /** Upserts UserStreak by comparing lastActiveDate to today; same-day resubmissions
   * are a no-op (can't inflate the streak by submitting twice in one day). */
  private async updateStreak(userId: number): Promise<StreakResult> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = await this.userStreakRepo.findOne({ where: { userId } });
    let milestoneHit: number | undefined;

    if (!streak) {
      streak = this.userStreakRepo.create({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
      });
      await this.userStreakRepo.save(streak);
    } else {
      const last = streak.lastActiveDate ? new Date(streak.lastActiveDate) : null;
      if (last) last.setHours(0, 0, 0, 0);
      const diffDays = last ? Math.round((today.getTime() - last.getTime()) / 86400000) : null;

      if (diffDays !== 0) {
        streak.currentStreak = diffDays === 1 ? streak.currentStreak + 1 : 1;
        streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
        streak.lastActiveDate = today;
        await this.userStreakRepo.save(streak);
        if (STREAK_MILESTONES.includes(streak.currentStreak)) {
          milestoneHit = streak.currentStreak;
        }
      }
    }

    return { streak, milestoneHit };
  }

  private async evaluateFirstQuizAndPerfectScoreBadges(
    userId: number,
    score: number,
    badgeContext: BadgeContext,
  ): Promise<void> {
    const quizResultCount = await this.quizResultRepo.count({ where: { userId } });
    if (quizResultCount === 1) await this.awardBadgeIfNew(userId, BADGE_CODES.FIRST_QUIZ, badgeContext);
    if (score === 100) await this.awardBadgeIfNew(userId, BADGE_CODES.PERFECT_SCORE, badgeContext);
  }

  /** Single global badge (not per-subject) — first subject where every trivia topic
   * reaches ≥70% correctCoverage awards it, then this check is skipped forever. */
  private async evaluateSubjectMasteredBadge(
    userId: number,
    subjectIds: number[],
    badgeContext: BadgeContext,
  ): Promise<void> {
    if (badgeContext.alreadyEarned.has(BADGE_CODES.SUBJECT_MASTERED)) return;

    for (const subjectId of subjectIds) {
      const topics = await this.topicAnalyzer.getTopicStatsBySubject(subjectId, userId);
      const trivia = topics.filter((t: any) => (+t.numTrivia || 0) > 0);
      // correctCoverage (not coverage) — mastery requires answering correctly, not
      // just attempting every question in the subject.
      if (trivia.length && trivia.every((t: any) => +t.correctCoverage >= 70)) {
        await this.awardBadgeIfNew(userId, BADGE_CODES.SUBJECT_MASTERED, badgeContext);
        return;
      }
    }
  }

  /**
   * Resolves candidate CertificationTracks touching the given subjects, checks each
   * one's completion via SubjectTrackAnalysisService.buildSubjectTrackMap() (the
   * same completion math the dashboards use — not re-derived here), and issues a
   * Certificate for any that cross CERT_ACHIEVED and aren't already issued.
   */
  private async evaluateCertifications(
    userId: number,
    subjectIds: number[],
  ): Promise<{ certificationTrackId: number; certificateNumber: string }[]> {
    const certificatesEarned: { certificationTrackId: number; certificateNumber: string }[] = [];
    if (!subjectIds.length) return certificatesEarned;

    const candidateCertTrackIds =
      await this.subjectTrackAnalyzer.getCertificationTrackIdsForSubjects(subjectIds);
    if (!candidateCertTrackIds.length) return certificatesEarned;

    const alreadyIssued = await this.certificateRepo.find({
      where: { userId, certificationTrackId: In(candidateCertTrackIds) },
    });
    const issuedSet = new Set(alreadyIssued.map((c) => c.certificationTrackId));
    const unissuedIds = candidateCertTrackIds.filter((id) => !issuedSet.has(id));
    if (!unissuedIds.length) return certificatesEarned;

    const hierarchyRows =
      await this.subjectTrackAnalyzer.fetchCertTrackSubjectTrackHierarchy(unissuedIds);

    const subjectTrackIdsByCert = new Map<number, Set<number>>();
    for (const row of hierarchyRows) {
      const ctId = +row.ctId;
      if (!subjectTrackIdsByCert.has(ctId)) subjectTrackIdsByCert.set(ctId, new Set());
      subjectTrackIdsByCert.get(ctId)!.add(+row.stId);
    }

    const allSubjectTrackIds = [...new Set(hierarchyRows.map((r) => +r.stId))];
    if (!allSubjectTrackIds.length) return certificatesEarned;

    const stRows = await this.subjectTrackAnalyzer.fetchSubjectTracksWithTopicsByIds(allSubjectTrackIds);
    const topicIds = [...new Set(stRows.map((r) => +r.topicId))];
    const topicStatsList = topicIds.length
      ? await this.topicAnalyzer.getTopicStatsByIds(topicIds, userId)
      : [];
    const topicStatsMap = new Map<number, any>(topicStatsList.map((t) => [t.id, t]));
    const subjectTrackMap = this.subjectTrackAnalyzer.buildSubjectTrackMap(
      stRows,
      topicStatsMap,
      { meritLists: new Map(), userRanks: new Map() },
      userId,
    );

    for (const [certTrackId, subjectTrackIdSet] of subjectTrackIdsByCert) {
      const subjectTrackIds = [...subjectTrackIdSet];
      const total = subjectTrackIds.length;
      if (!total) continue;
      const completed = subjectTrackIds.filter((id) => subjectTrackMap.get(id)?.isCompleted).length;
      const progressPercent = (completed / total) * 100;
      if (progressPercent < CERT_ACHIEVED) continue;

      const issued = await this.issueCertificate(userId, certTrackId);
      if (issued) certificatesEarned.push(issued);
    }

    return certificatesEarned;
  }

  private async issueCertificate(
    userId: number,
    certificationTrackId: number,
  ): Promise<{ certificationTrackId: number; certificateNumber: string } | null> {
    try {
      const cert = await this.certificateRepo.save(
        this.certificateRepo.create({
          userId,
          certificationTrackId,
          certificateNumber: `CM-${certificationTrackId}-${generate6DigitNumber()}`,
          verificationCode: `${generate6DigitNumber()}${generate6DigitNumber()}`,
        }),
      );

      const track = await this.certificationTrackRepo.findOne({ where: { id: certificationTrackId } });
      await this.notificationService.notifyCertificateIssued(
        userId,
        track?.title ?? 'Certification',
        cert.certificateNumber,
        certificationTrackId,
      );
      await this.activityService.createActivity(
        userId,
        'Certificate Earned',
        `You earned the "${track?.title ?? 'Certification'}" certificate.`,
        certificationTrackId,
        'certification_track',
      );

      return { certificationTrackId, certificateNumber: cert.certificateNumber };
    } catch (error) {
      // Unique(userId, certificationTrackId) race with a concurrent evaluation —
      // treat as already-issued and move on.
      this.logger.warn(
        `Certificate issuance skipped for userId=${userId}, certificationTrackId=${certificationTrackId}: ${error}`,
      );
      return null;
    }
  }

  private async awardBadgeIfNew(userId: number, code: string, badgeContext: BadgeContext): Promise<void> {
    if (badgeContext.alreadyEarned.has(code)) return;
    const badge = await this.badgeRepo.findOne({ where: { code } });
    if (!badge) return; // not seeded yet — skip silently

    await this.userBadgeRepo.save(this.userBadgeRepo.create({ userId, badgeId: badge.id }));
    badgeContext.alreadyEarned.add(code);
    badgeContext.badgesEarned.push({ code: badge.code, name: badge.name });

    await this.notificationService.notifyBadgeEarned(userId, badge.name, badge.id);
    await this.activityService.createActivity(
      userId,
      'Badge Earned',
      `You earned the "${badge.name}" badge.`,
      badge.id,
      'badge',
    );
  }

  /** A user's full badge collection — earned ones (with earnedAt) plus the still-locked catalog entries. */
  async getUserBadges(userId: number) {
    const [allBadges, earned] = await Promise.all([
      this.badgeRepo.find({ order: { id: 'ASC' } }),
      this.userBadgeRepo.find({ where: { userId } }),
    ]);
    const earnedByBadgeId = new Map(earned.map((ub) => [ub.badgeId, ub.earnedAt]));

    const toDto = (badge: Badge) => ({
      code: badge.code,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
      points: badge.points,
      earnedAt: earnedByBadgeId.get(badge.id) ?? null,
    });

    return {
      earned: allBadges.filter((b) => earnedByBadgeId.has(b.id)).map(toDto),
      locked: allBadges.filter((b) => !earnedByBadgeId.has(b.id)).map(toDto),
    };
  }
}
