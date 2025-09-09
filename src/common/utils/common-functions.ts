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
  wrong: number,
  avgAccuracy: number
): number => {
  // Base score: reward correct, partial reward for attempt
  let score =
    correct * 0.5 +               // correct answers
    attempted * 0.2 +             // bonus for attempting
    avgAccuracy * 100 * 0.1;      // less weightage to accuracy

  // Apply negative marking: -20% of the value per wrong answer
  score -= wrong * 0.5 * 0.2;     // deduct 20% of correct-answer value

  return score < 0 ? 0 : score;   // prevent negative scores
};

