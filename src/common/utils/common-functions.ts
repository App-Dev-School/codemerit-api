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


