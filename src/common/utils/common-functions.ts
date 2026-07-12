import { Subject } from "../typeorm/entities/subject.entity";
import { Topic } from "../typeorm/entities/topic.entity";

export const generate6DigitNumber = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getTitleBySubjectIds = (subjects: Subject[]): string => {
   // Example: join subject names with comma, or return an empty string if not available
   return subjects && subjects.length > 0 ? subjects.map((s: Subject) => s.title).join(' ') : '';
};

export const getTitleByTopicIds = (topics: Topic[]): string => {
   return topics && topics.length > 0 ? topics.map((t: Topic) => t.title).join(' ') : '';
};

export const generateScore = (
  attempted: number,
  correct: number,
  wrong: number
): number => {
  if (attempted === 0) return 0;
  // Correct answers = +1 point each
  // Wrong answers = -0.2 penalty each (20% negative marking)
  // Skipped = 0
  const rawScore = correct - wrong * 0.2;
  const normalized = (rawScore / attempted) * 100;
  return Math.max(0, Math.min(100, Number(normalized.toFixed(1))));
};

export type AggregateUserLevel =
  | 'Not Started'
  | 'Novice'
  | 'Beginner'
  | 'Developing'
  | 'Intermediate'
  | 'Proficient'
  | 'Advanced';

// Below this many attempts TOTAL (across all tiers combined), there isn't enough
// signal yet to trust any tier's accuracy % — stay at 'Novice' rather than guess.
const MIN_ATTEMPTS_FOR_CONFIDENCE = 3;

/**
 * Classifies a user's current level for a topic/subject-track/subject from their
 * attempted/correct counts per difficulty tier. Gated by MIN_ATTEMPTS_FOR_CONFIDENCE
 * (on total attempts, not per-tier — a topic's attempts are often split thin across
 * tiers, and requiring 3 in the *same* tier would misclassify a clean 3/3 spread
 * across Easy+Intermediate as 'Novice').
 */
export const getAggregateUserLevel = (
  attemptedEasy: number,
  correctEasy: number,
  attemptedIntermediate: number,
  correctIntermediate: number,
  attemptedAdvanced: number,
  correctAdvanced: number,
): AggregateUserLevel => {
  const totalAttempted = attemptedEasy + attemptedIntermediate + attemptedAdvanced;
  if (totalAttempted === 0) return 'Not Started';
  if (totalAttempted < MIN_ATTEMPTS_FOR_CONFIDENCE) return 'Novice';

  const easyAccuracy = attemptedEasy > 0 ? correctEasy / attemptedEasy : 0;
  const intermediateAccuracy = attemptedIntermediate > 0 ? correctIntermediate / attemptedIntermediate : 0;
  const advancedAccuracy = attemptedAdvanced > 0 ? correctAdvanced / attemptedAdvanced : 0;

  if (attemptedAdvanced > 0 && advancedAccuracy >= 0.5) {
    return 'Advanced';
  }

  if (attemptedIntermediate > 0) {
    if (intermediateAccuracy >= 0.75 || attemptedAdvanced > 0) return 'Proficient';
    if (intermediateAccuracy >= 0.5) return 'Intermediate';
    return 'Developing';
  }

  if (attemptedEasy > 0) {
    if (easyAccuracy >= 0.75) return 'Developing';
    if (easyAccuracy >= 0.4) return 'Beginner';
  }

  return 'Novice';
};

export function shuffleArray(array) {
  // Used for randomzing Don't mutate the original array
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}


