import { Injectable } from '@nestjs/common';
import { generateScore, getAggregateUserLevel } from 'src/common/utils/common-functions';
import { DataSource } from 'typeorm';
import { MeritService } from './merit.service';

const TOPIC_DONE = 70;   // coverage % to mark a topic complete
const TRACK_DONE = 70;   // % of topics done to mark a subject track complete

/**
 * Rolls up topic-level stats (from TopicAnalysisService) into SubjectTrack-level
 * cards. A SubjectTrack is a many-to-many grouping of Topics (via
 * subject_track_topic), so stats are computed by fetching per-topic aggregates
 * once (single grouped query, no per-track fan-out into question/question_attempt)
 * and summing them in memory per track — avoiding a second heavy join through
 * subject_track_topic -> question_topic -> question -> question_attempt.
 */
@Injectable()
export class SubjectTrackAnalysisService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly meritService: MeritService,
  ) {}

  /** All subject tracks for the given subjects, each row = one (track, topic) pair. */
  async fetchSubjectTracksWithTopics(subjectIds: number[]) {
    if (!subjectIds.length) return [];
    return this.dataSource
      .createQueryBuilder()
      .select('st.id', 'stId')
      .addSelect('st.title', 'stTitle')
      .addSelect('st.slug', 'stSlug')
      .addSelect('st.description', 'stDesc')
      .addSelect('st.sortOrder', 'stSortOrder')
      .addSelect('st.subjectId', 'stSubjectId')
      .addSelect('s.title', 'stSubjectTitle')
      .addSelect('s.slug', 'stSubjectSlug')
      .addSelect('t.id', 'topicId')
      .addSelect('t.title', 'topicTitle')
      .addSelect('t.slug', 'topicSlug')
      .addSelect('t.label', 'topicLabel')
      .addSelect('t.order', 'topicOrder')
      .from('subject_track', 'st')
      .innerJoin('subject', 's', 's.id = st.subjectId')
      .innerJoin('subject_track_topic', 'stt', 'stt.subjectTrackId = st.id')
      .innerJoin('topic', 't', 't.id = stt.topicId AND t.isPublished = 1')
      .where('st.subjectId IN (:...subjectIds)', { subjectIds })
      .andWhere('st.isPublished = 1')
      .orderBy('st.subjectId', 'ASC')
      .addOrderBy('st.sortOrder', 'ASC')
      .addOrderBy('t.order', 'ASC')
      .getRawMany();
  }

  /** Subject tracks + topics filtered by explicit subject-track IDs (e.g. a cert-track hierarchy). */
  async fetchSubjectTracksWithTopicsByIds(subjectTrackIds: number[]) {
    if (!subjectTrackIds.length) return [];
    return this.dataSource
      .createQueryBuilder()
      .select('st.id', 'stId')
      .addSelect('st.title', 'stTitle')
      .addSelect('st.slug', 'stSlug')
      .addSelect('st.description', 'stDesc')
      .addSelect('st.sortOrder', 'stSortOrder')
      .addSelect('st.subjectId', 'stSubjectId')
      .addSelect('s.title', 'stSubjectTitle')
      .addSelect('s.slug', 'stSubjectSlug')
      .addSelect('t.id', 'topicId')
      .addSelect('t.title', 'topicTitle')
      .addSelect('t.slug', 'topicSlug')
      .addSelect('t.label', 'topicLabel')
      .addSelect('t.order', 'topicOrder')
      .from('subject_track', 'st')
      .innerJoin('subject', 's', 's.id = st.subjectId')
      .innerJoin('subject_track_topic', 'stt', 'stt.subjectTrackId = st.id')
      .innerJoin('topic', 't', 't.id = stt.topicId AND t.isPublished = 1')
      .where('st.id IN (:...subjectTrackIds)', { subjectTrackIds })
      .andWhere('st.isPublished = 1')
      .orderBy('st.sortOrder', 'ASC')
      .addOrderBy('t.order', 'ASC')
      .getRawMany();
  }

  /**
   * Builds a Map<subjectTrackId, computedTrack> from the raw (track, topic) rows
   * and a pre-fetched map of per-topic stats (see TopicAnalysisService.getTopicStatsByIds).
   * Shared by subjectDashboard, programDetails and careerDashboard so all three
   * report subject-track progress identically.
   */
  buildSubjectTrackMap(
    stRows: any[],
    topicStatsMap: Map<number, any>,
    stMerits: { meritLists: Map<number, any[]>; userRanks: Map<number, number | null> },
    userId?: number,
  ): Map<number, any> {
    type StEntry = { meta: any; topicIds: number[] };
    const stIndex = new Map<number, StEntry>();

    for (const row of stRows) {
      const stId = +row.stId;
      if (!stIndex.has(stId)) {
        stIndex.set(stId, {
          meta: {
            id: stId,
            title: row.stTitle,
            slug: row.stSlug,
            description: row.stDesc,
            sortOrder: +row.stSortOrder,
            subjectId: +row.stSubjectId,
            subjectName: row.stSubjectTitle,
          },
          topicIds: [],
        });
      }
      stIndex.get(stId)!.topicIds.push(+row.topicId);
    }

    const result = new Map<number, any>();

    for (const [stId, { meta, topicIds }] of stIndex) {
      const topics = topicIds.map((tid) => {
        const ts = topicStatsMap.get(tid) ?? {};
        const numTrivia = +ts.numTrivia || 0;
        const attempted = +ts.myUniqueAttempts || 0;
        const allAttempts = +ts.myAllAttempts || 0;
        const correct = +ts.correct || 0;
        const wrong = +ts.wrong || 0;
        const coverage = numTrivia > 0 ? +((attempted / numTrivia) * 100).toFixed(1) : 0;
        const accuracy = allAttempts > 0 ? +(correct * 100 / allAttempts).toFixed(1) : 0;
        const score = +generateScore(allAttempts, correct, wrong).toFixed(0);
        const isCompleted = coverage >= TOPIC_DONE;
        const attemptedEasy = +ts.attemptedEasy || 0;
        const attemptedMedium = +ts.attemptedMedium || 0;
        const attemptedHard = +ts.attemptedHard || 0;
        const correctEasy = +ts.correctEasy || 0;
        const correctMedium = +ts.correctMedium || 0;
        const correctHard = +ts.correctHard || 0;
        const wrongEasy = +ts.wrongEasy || 0;
        const wrongMedium = +ts.wrongMedium || 0;
        const wrongHard = +ts.wrongHard || 0;

        return {
          id: tid,
          title: ts.title,
          slug: ts.slug,
          label: ts.label,
          numTrivia,
          attempted,
          correct,
          wrong,
          accuracy,
          coverage,
          score,
          attemptedEasy,
          attemptedMedium,
          attemptedHard,
          correctEasy,
          correctMedium,
          correctHard,
          wrongEasy,
          wrongMedium,
          wrongHard,
          userLevel: ts.userLevel,
          isStarted: allAttempts > 0,
          isCompleted,
        };
      });

      const stNumTrivia = topics.reduce((s: number, t: any) => s + (t.numTrivia || 0), 0);
      const stAttempted = topics.reduce((s: number, t: any) => s + (t.attempted || 0), 0);
      const stAllAttempts = topicIds.reduce(
        (s: number, tid: number) => s + (+(topicStatsMap.get(tid)?.myAllAttempts) || 0),
        0,
      );
      const stCorrect = topics.reduce((s: number, t: any) => s + (t.correct || 0), 0);
      const stWrong = topics.reduce((s: number, t: any) => s + (t.wrong || 0), 0);
      const stCoverage = stNumTrivia > 0 ? +((stAttempted / stNumTrivia) * 100).toFixed(1) : 0;
      const stAccuracy = stAllAttempts > 0 ? +(stCorrect * 100 / stAllAttempts).toFixed(1) : 0;
      const stScore = +generateScore(stAllAttempts, stCorrect, stWrong).toFixed(0);
      const stAttemptedEasy = topics.reduce((s: number, t: any) => s + (t.attemptedEasy || 0), 0);
      const stAttemptedMedium = topics.reduce((s: number, t: any) => s + (t.attemptedMedium || 0), 0);
      const stAttemptedHard = topics.reduce((s: number, t: any) => s + (t.attemptedHard || 0), 0);
      const stCorrectEasy = topics.reduce((s: number, t: any) => s + (t.correctEasy || 0), 0);
      const stCorrectMedium = topics.reduce((s: number, t: any) => s + (t.correctMedium || 0), 0);
      const stCorrectHard = topics.reduce((s: number, t: any) => s + (t.correctHard || 0), 0);
      const stWrongEasy = topics.reduce((s: number, t: any) => s + (t.wrongEasy || 0), 0);
      const stWrongMedium = topics.reduce((s: number, t: any) => s + (t.wrongMedium || 0), 0);
      const stWrongHard = topics.reduce((s: number, t: any) => s + (t.wrongHard || 0), 0);
      const totalTopics = topics.length;
      const completedTopics = topics.filter((t: any) => t.isCompleted).length;
      const progressPercent = totalTopics > 0 ? +((completedTopics / totalTopics) * 100).toFixed(0) : 0;
      const isCompleted = progressPercent >= TRACK_DONE;

      result.set(stId, {
        ...meta,
        totalTopics,
        numTrivia: stNumTrivia,
        attempted: stAttempted,
        correct: stCorrect,
        wrong: stWrong,
        coverage: stCoverage,
        accuracy: stAccuracy,
        score: stScore,
        attemptedEasy: stAttemptedEasy,
        attemptedMedium: stAttemptedMedium,
        attemptedHard: stAttemptedHard,
        correctEasy: stCorrectEasy,
        correctMedium: stCorrectMedium,
        correctHard: stCorrectHard,
        wrongEasy: stWrongEasy,
        wrongMedium: stWrongMedium,
        wrongHard: stWrongHard,
        userLevel: getAggregateUserLevel(
          stAttemptedEasy, stCorrectEasy,
          stAttemptedMedium, stCorrectMedium,
          stAttemptedHard, stCorrectHard,
        ),
        isStarted: stAllAttempts > 0,
        completedTopics,
        progressPercent,
        isCompleted,
        meritList: stMerits.meritLists.get(stId) ?? [],
        userRank: userId != null ? stMerits.userRanks.get(stId) ?? null : null,
        topics,
      });
    }

    return result;
  }

  /**
   * Full subjectTracks (with topic breakdown + merit lists) for one subject.
   * Takes an already-computed topic-stats map (e.g. the "syllabus" stats a
   * caller already fetched via TopicAnalysisService.getTopicStatsBySubject) so
   * this never issues its own duplicate join over question_topic/question for
   * the same topic set — only the (cheap) track/topic mapping + merit-list
   * queries are run here.
   */
  async getSubjectTracksBySubject(
    subjectId: number,
    topicStatsMap: Map<number, any>,
    userId?: number,
  ): Promise<any[]> {
    const stRows = await this.fetchSubjectTracksWithTopics([subjectId]);
    if (!stRows.length) return [];

    const stIds = [...new Set(stRows.map((r) => +r.stId))];
    const stMerits = await this.meritService.getSubjectTrackMeritsWithRanks(stIds, userId);
    const stMap = this.buildSubjectTrackMap(stRows, topicStatsMap, stMerits, userId);

    return stIds.map((id) => stMap.get(id)).filter(Boolean).sort((a: any, b: any) => a.sortOrder - b.sortOrder);
  }
}
