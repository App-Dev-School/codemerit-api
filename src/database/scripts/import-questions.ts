import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../data-source';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { QuestionOption } from 'src/common/typeorm/entities/question-option.entity';
import { QuestionTopic } from 'src/common/typeorm/entities/quesion-topic.entity';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';
import { QuestionStatusEnum } from 'src/common/enum/question-status.enum';

interface OptionInput {
  option: string;
  correct: boolean;
  comment?: string;
}

interface QuestionInput {
  slug?: string;         // present in exported files; used as update key when --update is passed
  topicTitle: string;
  question: string;
  questionType?: QuestionTypeEnum;
  level: 1 | 2 | 3;
  timeAllowed: number;
  answer?: string;
  hint?: string;
  options?: OptionInput[];
}

interface QuestionsFile {
  subjectSlug: string;
  questions: QuestionInput[];
}

function buildSlug(text: string, subjectSlug: string): string {
  const prefix = subjectSlug
    .split('-')
    .map((w) => w[0])
    .join('')
    .slice(0, 4);
  const body = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join('-');
  const raw = `${prefix}-${body}`;
  return raw.slice(0, 48);
}

async function uniqueSlug(
  base: string,
  repo: { findOne: (opts: any) => Promise<any> },
): Promise<string> {
  let candidate = base;
  let i = 2;
  while (await repo.findOne({ where: { slug: candidate } })) {
    candidate = `${base.slice(0, 45)}-${i++}`;
  }
  return candidate;
}

async function main() {
  const args = process.argv.slice(2);
  const updateMode = args.includes('--update');
  const filePath   = args.find((a) => !a.startsWith('-'));

  if (!filePath) {
    console.error('Usage: npm run import:questions -- <file.json> [--update]');
    console.error('  --update  Update existing questions in-place instead of skipping them.');
    console.error('            Matches by slug (if present in file) or question text + topic.');
    console.error('            Options are updated by position — option order must stay the same.');
    console.error('            Question slug is never changed during an update.');
    process.exit(1);
  }

  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const input: QuestionsFile = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));

  await AppDataSource.initialize();
  console.log(`Database connected.${updateMode ? ' (update mode)' : ''}\n`);

  const subjectRepo       = AppDataSource.getRepository(Subject);
  const topicRepo         = AppDataSource.getRepository(Topic);
  const questionRepo      = AppDataSource.getRepository(Question);
  const optionRepo        = AppDataSource.getRepository(QuestionOption);
  const questionTopicRepo = AppDataSource.getRepository(QuestionTopic);

  const subject = await subjectRepo.findOne({ where: { slug: input.subjectSlug } });
  if (!subject) {
    console.error(`Subject with slug "${input.subjectSlug}" not found.`);
    process.exit(1);
  }
  console.log(`Subject: ${subject.title} (id=${subject.id})\n`);

  const dbTopics    = await topicRepo.find({ where: { subjectId: subject.id } });
  const topicByTitle = new Map(dbTopics.map((t) => [t.title, t]));

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let warned  = 0;

  for (const data of input.questions) {
    // ── Validate ────────────────────────────────────────────────────────────
    const questionType = data.questionType ?? QuestionTypeEnum.Trivia;

    if (questionType === QuestionTypeEnum.General) {
      if (data.options && data.options.length > 0) {
        console.warn(`  ⚠  Skipping "${data.question.slice(0, 60)}..." — general questions must not include options`);
        warned++; continue;
      }
      if (!data.answer?.trim()) {
        console.warn(`  ⚠  Skipping "${data.question.slice(0, 60)}..." — general questions must include an answer`);
        warned++; continue;
      }
    } else {
      const options = data.options ?? [];
      const correctCount = options.filter((o) => o.correct).length;
      if (options.length !== 4 || correctCount !== 1) {
        console.warn(`  ⚠  Skipping "${data.question.slice(0, 60)}..." — must have 4 options and exactly 1 correct`);
        warned++; continue;
      }
      const tooLong = options.find((o) => o.option.length > 100);
      if (tooLong) {
        console.warn(`  ⚠  Option too long (>100 chars): "${tooLong.option.slice(0, 60)}..."`);
        warned++; continue;
      }
    }

    const topic = topicByTitle.get(data.topicTitle);
    if (!topic) {
      console.warn(`  ⚠  Topic not found: "${data.topicTitle}" — skipped`);
      warned++; continue;
    }

    // ── Find existing question ───────────────────────────────────────────────
    // Prefer slug match (present in exported files); fall back to text + topic.
    let existingQuestion: Question | null = null;

    if (data.slug) {
      existingQuestion = await questionRepo.findOne({ where: { slug: data.slug } });
    }

    if (!existingQuestion) {
      const existingLink = await questionTopicRepo
        .createQueryBuilder('qt')
        .innerJoin('qt.question', 'q')
        .where('qt.topicId = :topicId', { topicId: topic.id })
        .andWhere('q.question = :text', { text: data.question })
        .getOne();
      if (existingLink) {
        existingQuestion = await questionRepo.findOne({ where: { id: existingLink.questionId } });
      }
    }

    // ── Update path ──────────────────────────────────────────────────────────
    if (existingQuestion) {
      if (!updateMode) {
        skipped++; continue;
      }

      // Update question fields in-place (slug is intentionally excluded)
      await questionRepo.update(existingQuestion.id, {
        question:      data.question,
        questionType,
        level:         data.level,
        marks:         data.level,
        timeAllowed:   data.timeAllowed,
        answer:        data.answer ?? null,
        hint:          data.hint ?? null,
      });

      if (questionType !== QuestionTypeEnum.General) {
        // Update options in-place by position (ORDER BY id ASC = original insertion order)
        const existingOptions = await optionRepo.find({
          where: { questionId: existingQuestion.id },
          order: { id: 'ASC' },
        });

        const options = data.options ?? [];
        for (let i = 0; i < options.length; i++) {
          if (existingOptions[i]) {
            await optionRepo.update(existingOptions[i].id, {
              option:  options[i].option,
              correct: options[i].correct,
              comment: options[i].comment ?? null,
            });
          }
        }
      }

      // Update topic link if it has changed
      const existingQT = await questionTopicRepo.findOne({
        where: { questionId: existingQuestion.id },
      });
      if (existingQT && existingQT.topicId !== topic.id) {
        await questionTopicRepo.update(existingQT.id, { topicId: topic.id });
      }

      updated++; continue;
    }

    // ── Insert path ──────────────────────────────────────────────────────────
    const slug = await uniqueSlug(buildSlug(data.question, input.subjectSlug), questionRepo);

    const question = await questionRepo.save(
      questionRepo.create({
        slug,
        question:      data.question,
        subjectId:     subject.id,
        questionType,
        level:         data.level,
        marks:         data.level,
        timeAllowed:   data.timeAllowed,
        answer:        data.answer ?? null,
        hint:          data.hint ?? null,
        status:        QuestionStatusEnum.Active,
        isWhitelisted: false,
      }),
    );

    if (questionType !== QuestionTypeEnum.General) {
      const options = data.options ?? [];
      for (const opt of options) {
        await optionRepo.save(
          optionRepo.create({
            questionId: question.id,
            option:     opt.option,
            correct:    opt.correct,
            comment:    opt.comment ?? null,
          }),
        );
      }
    }

    await questionTopicRepo.save(
      questionTopicRepo.create({ questionId: question.id, topicId: topic.id }),
    );

    created++;
  }

  const updateSummary = updateMode ? `, ${updated} updated` : '';
  console.log(
    `Questions: ${created} created${updateSummary}, ${skipped} already existed${warned ? `, ${warned} skipped (validation error)` : ''}`,
  );
  console.log('\nDone.');
  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error('\nImport failed:', err);
  process.exit(1);
});
