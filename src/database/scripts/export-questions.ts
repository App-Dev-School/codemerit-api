import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../data-source';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { QuestionOption } from 'src/common/typeorm/entities/question-option.entity';
import { QuestionTopic } from 'src/common/typeorm/entities/quesion-topic.entity';

async function main() {
  const subjectSlug = process.argv[2];
  if (!subjectSlug) {
    console.error('Usage: npm run export:questions -- <subject-slug> [output-file]');
    process.exit(1);
  }

  await AppDataSource.initialize();
  console.log('Database connected.\n');

  const subject = await AppDataSource.getRepository(Subject).findOne({
    where: { slug: subjectSlug },
  });
  if (!subject) {
    console.error(`Subject "${subjectSlug}" not found.`);
    process.exit(1);
  }
  console.log(`Subject: ${subject.title} (id=${subject.id})\n`);

  const questionRepo     = AppDataSource.getRepository(Question);
  const optionRepo       = AppDataSource.getRepository(QuestionOption);
  const questionTopicRepo = AppDataSource.getRepository(QuestionTopic);
  const topicRepo        = AppDataSource.getRepository(Topic);

  // Load all topics for this subject keyed by id
  const topics   = await topicRepo.find({ where: { subjectId: subject.id }, order: { order: 'ASC' } });
  const topicById = new Map(topics.map((t) => [t.id, t]));

  // Load all questions for this subject ordered by id (insertion order)
  const questions = await questionRepo.find({
    where: { subjectId: subject.id },
    order: { id: 'ASC' },
  });

  if (questions.length === 0) {
    console.log('No questions found for this subject.');
    process.exit(0);
  }

  // Load all question-topic links for these questions in one query
  const questionIds = questions.map((q) => q.id);
  const qtLinks = await questionTopicRepo
    .createQueryBuilder('qt')
    .where('qt.questionId IN (:...ids)', { ids: questionIds })
    .getMany();
  const topicIdByQuestionId = new Map(qtLinks.map((qt) => [qt.questionId, qt.topicId]));

  // Load all options for these questions in one query, ordered by id (insertion order = position)
  const allOptions = await optionRepo
    .createQueryBuilder('o')
    .where('o.questionId IN (:...ids)', { ids: questionIds })
    .orderBy('o.id', 'ASC')
    .getMany();
  const optionsByQuestionId = new Map<number, QuestionOption[]>();
  for (const opt of allOptions) {
    if (!optionsByQuestionId.has(opt.questionId)) {
      optionsByQuestionId.set(opt.questionId, []);
    }
    optionsByQuestionId.get(opt.questionId)!.push(opt);
  }

  // Group questions by topic order so the file reads the same as the original seed
  const questionsByTopicId = new Map<number, Question[]>();
  const unknownTopicQuestions: Question[] = [];

  for (const q of questions) {
    const topicId = topicIdByQuestionId.get(q.id);
    if (topicId !== undefined) {
      if (!questionsByTopicId.has(topicId)) questionsByTopicId.set(topicId, []);
      questionsByTopicId.get(topicId)!.push(q);
    } else {
      unknownTopicQuestions.push(q);
    }
  }

  const outputQuestions: object[] = [];

  // Emit questions in topic order
  for (const topic of topics) {
    const qs = questionsByTopicId.get(topic.id) ?? [];
    for (const q of qs) {
      const options = optionsByQuestionId.get(q.id) ?? [];
      outputQuestions.push({
        slug:        q.slug,
        topicTitle:  topic.title,
        question:    q.question,
        questionType: q.questionType,
        level:       q.level,
        timeAllowed: q.timeAllowed,
        answer:      q.answer,
        hint:        q.hint,
        options: options.map((o) => {
          const entry: Record<string, unknown> = {
            option:  o.option,
            correct: o.correct,
          };
          if (o.comment) entry.comment = o.comment;
          return entry;
        }),
      });
    }
  }

  // Emit any questions without a topic link at the end
  for (const q of unknownTopicQuestions) {
    const options = optionsByQuestionId.get(q.id) ?? [];
    outputQuestions.push({
      slug:         q.slug,
      topicTitle:   '(unknown topic)',
      question:     q.question,
      questionType: q.questionType,
      level:        q.level,
      timeAllowed:  q.timeAllowed,
      answer:       q.answer,
      hint:         q.hint,
      options: options.map((o) => {
        const entry: Record<string, unknown> = {
          option:  o.option,
          correct: o.correct,
        };
        if (o.comment) entry.comment = o.comment;
        return entry;
      }),
    });
  }

  const output = { subjectSlug, questions: outputQuestions };

  const outputPath =
    process.argv[3] ??
    path.join(process.cwd(), `src/database/seeds/questions-${subjectSlug}.json`);

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Exported ${outputQuestions.length} questions → ${outputPath}`);
  console.log('\nDone.');
  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error('\nExport failed:', err);
  process.exit(1);
});
